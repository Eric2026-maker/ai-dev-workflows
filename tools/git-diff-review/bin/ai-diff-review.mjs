#!/usr/bin/env node

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const systemPromptPath = resolve(__dirname, '../prompts/review-system.md');

function parseArgs(argv) {
  const args = {
    cached: false,
    base: null,
    promptOnly: false,
    maxChars: 30000,
    model: process.env.OPENAI_MODEL || 'gpt-4.1-mini'
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--cached') args.cached = true;
    else if (arg === '--prompt-only') args.promptOnly = true;
    else if (arg === '--base') args.base = argv[++i];
    else if (arg === '--model') args.model = argv[++i];
    else if (arg === '--max-chars') args.maxChars = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage:
  node bin/ai-diff-review.mjs --cached [--prompt-only]
  node bin/ai-diff-review.mjs --base HEAD~1 [--prompt-only]

Options:
  --cached          Review staged changes
  --base <ref>      Review changes against a git ref
  --prompt-only     Print the prompt without calling an API
  --model <name>    Model name, defaults to OPENAI_MODEL or gpt-4.1-mini
  --max-chars <n>   Maximum diff characters, defaults to 30000
`);
}

function getDiff(args) {
  const gitArgs = ['diff'];
  if (args.cached) gitArgs.push('--cached');
  else if (args.base) gitArgs.push(args.base);

  const diff = execFileSync('git', gitArgs, { encoding: 'utf8' });
  return diff.trim();
}

function buildUserPrompt(diff, maxChars) {
  const truncated = diff.length > maxChars;
  const safeDiff = truncated ? diff.slice(0, maxChars) : diff;

  return `Please review this git diff.

${truncated ? `Note: the diff was truncated to ${maxChars} characters.\n` : ''}
\`\`\`diff
${safeDiff}
\`\`\``;
}

async function callOpenAI({ apiKey, model, systemPrompt, userPrompt }) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      input: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.2
    })
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  if (data.output_text) return data.output_text;

  const parts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.text) parts.push(content.text);
    }
  }
  return parts.join('\n').trim();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const systemPrompt = readFileSync(systemPromptPath, 'utf8');
  const diff = getDiff(args);

  if (!diff) {
    console.error('No git diff found. Use --cached after staging files, or --base <ref>.');
    process.exit(1);
  }

  const userPrompt = buildUserPrompt(diff, args.maxChars);

  if (args.promptOnly || !process.env.OPENAI_API_KEY) {
    console.log('# System Prompt\n');
    console.log(systemPrompt.trim());
    console.log('\n# User Prompt\n');
    console.log(userPrompt);

    if (!args.promptOnly) {
      console.error('\nOPENAI_API_KEY is not set, so only the prompt was printed.');
    }
    return;
  }

  const review = await callOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    model: args.model,
    systemPrompt,
    userPrompt
  });

  console.log(review);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
