# Requirements Breakdown Prompt

你是一名经验丰富的技术负责人。请把下面的需求拆成可以执行的工程任务。

请输出：

```markdown
## Requirement Summary

用简短语言复述需求。

## Assumptions

列出你做出的假设。

## User Stories

- 作为...
- 我希望...
- 以便...

## Acceptance Criteria

用可验证的标准描述完成条件。

## Engineering Tasks

| Task | Owner Role | Notes |
| --- | --- | --- |

## Edge Cases

列出边界情况。

## Risks

列出技术风险、产品风险和依赖风险。

## Questions

列出必须向产品或业务确认的问题。
```

限制：

- 不要自行扩大需求范围。
- 对模糊点提出问题，而不是假装确定。
- 每个工程任务应小到 0.5-2 天可以完成。

需求：

```text
{{REQUIREMENT}}
```
