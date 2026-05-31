# Git Diff Review CLI

一个最小版 AI Code Review CLI。

它会读取当前仓库的 Git diff，并生成结构化 Review Prompt。配置 `OPENAI_API_KEY` 后，可以直接调用模型输出 Review。

## 使用方式

只生成 Prompt：

```bash
node bin/ai-diff-review.mjs --prompt-only --cached
```

Review 暂存区改动：

```bash
node bin/ai-diff-review.mjs --cached
```

Review 相对某个 base 的改动：

```bash
node bin/ai-diff-review.mjs --base HEAD~1
```

指定模型：

```bash
node bin/ai-diff-review.mjs --cached --model gpt-4.1-mini
```

## 环境变量

- `OPENAI_API_KEY`：OpenAI API Key
- `OPENAI_MODEL`：默认模型名

## 参数

- `--cached`：读取暂存区 diff
- `--base <ref>`：读取 `git diff <ref>` 的 diff
- `--prompt-only`：只输出 Prompt，不调用 API
- `--max-chars <n>`：限制 diff 最大字符数，默认 30000
- `--model <name>`：指定模型

## 定位

这个工具不是为了替代人工 Review。

它适合：

- 提交 PR 前自查
- 帮 Reviewer 做第一轮风险扫描
- 把团队 Review 规则沉淀成模板
- 作为 GitHub Actions 自动 Review 的基础
