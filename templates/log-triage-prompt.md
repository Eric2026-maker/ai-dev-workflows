# Log Triage Prompt

Use this prompt when you want AI to turn raw logs, stack traces, or alert messages into a structured incident triage report.

## Prompt

You are a senior backend engineer helping triage a production incident.

Your job is not to guess the final root cause too early.
Your job is to extract facts from logs, separate facts from assumptions, and propose the next verification steps.

Analyze the logs below and produce a structured report.

Rules:

- Do not invent services, files, functions, metrics, or deployment history that are not present in the input.
- Clearly separate facts from assumptions.
- If the logs are insufficient, say what information is missing.
- Prefer actionable verification steps over generic advice.
- Include test cases that should be added after the fix.
- Include rollback or mitigation notes if the issue may affect production users.
- If sensitive data appears in the logs, point it out and suggest redaction.

Output format:

```markdown
## Incident Summary

Summarize the incident in 3-5 sentences.

## Facts From Logs

- Time:
- Service:
- Endpoint / Job:
- Trace ID / Request ID:
- User / Tenant:
- Error Type:
- Error Location:
- Related Fields:

## Assumptions

- Assumption:
- Why it might be true:
- How to verify:

## Most Likely Cause

Explain the most likely cause based only on the logs.
Use confidence level: Low / Medium / High.

## What To Verify Next

1.
2.
3.

## Suggested Fix

- Short-term mitigation:
- Code fix:
- Data/config fix:
- Operational follow-up:

## Tests To Add

- Unit tests:
- Integration tests:
- Regression tests:

## Risk And Rollback Notes

- User impact:
- Rollback option:
- Monitoring to watch:
```

Logs:

```text
<PASTE_LOGS_HERE>
```

