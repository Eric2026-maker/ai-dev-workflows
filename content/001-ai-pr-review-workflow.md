# 我用 AI 做了一个 PR Review 工作流

## 开头

AI 编程工具已经不稀奇了，但很多人还停留在“让 AI 帮我写一段代码”。

我更关心另一件事：

> 能不能把 AI 接进真实研发流程，让它在每次提交代码时自动帮我做第一轮 Review？

这篇文章用一个最小 demo 演示：读取 Git diff，生成结构化 Review Prompt，再交给 AI 输出代码风险、测试建议和可维护性建议。

## 为什么从 PR Review 开始

因为它有几个典型特点：

1. 输入明确：代码 diff。
2. 输出明确：问题、风险、建议。
3. 价值容易感知：减少低级错误，提高 Review 起点。
4. 不要求完全替代人：AI 做第一轮筛查，人做最终判断。

这比“让 AI 写整个项目”更可控，也更适合团队落地。

## 工作流设计

这个 demo 分成 4 步：

1. 从 Git 读取 diff。
2. 把 diff 和 Review 规则合成 Prompt。
3. 调用 AI 模型生成 Review。
4. 输出 Markdown 格式结果。

最小流程：

```text
git diff -> review prompt -> AI review -> markdown report
```

## Review 规则

我希望 AI 不要泛泛评价，而是重点看这些问题：

- 是否有明显 bug
- 是否有边界条件遗漏
- 是否有安全风险
- 是否有性能风险
- 是否有可读性和维护性问题
- 是否需要补测试
- 是否存在过度设计

这几个维度比“代码写得怎么样”更具体，也更容易得到可执行建议。

## 本地运行

进入工具目录：

```bash
cd tools/git-diff-review
```

先只生成 Prompt：

```bash
node bin/ai-diff-review.mjs --prompt-only --cached
```

如果你没有暂存代码，可以比较最近一次提交：

```bash
node bin/ai-diff-review.mjs --prompt-only --base HEAD~1
```

配置 API Key 后可以直接生成 Review：

```bash
set OPENAI_API_KEY=你的 key
node bin/ai-diff-review.mjs --cached
```

## 输出示例

AI 应该输出这样的结构：

```markdown
## Summary

这次修改主要影响了...

## Must Fix

- 问题：
- 位置：
- 原因：
- 建议：

## Should Improve

- ...

## Tests To Add

- ...
```

## 这个工具不该做什么

它不应该替代人工 Review。

更合理的定位是：

- 提前发现明显问题
- 帮 Review 人节省第一轮扫描时间
- 给作者提交 PR 前一个自查机会
- 把团队 Review 标准沉淀成模板

## 下一步可以怎么扩展

1. 接入 GitHub Actions，在 PR 时自动评论。
2. 根据项目语言加载不同 Review 规则。
3. 只 Review 指定目录，比如 `src/`。
4. 输出测试建议并生成测试草稿。
5. 把团队规范写进 prompt，比如日志、异常处理、API 风格。

## 结论

AI 编程真正有价值的地方，不只是让它帮你写代码。

更高价值的方向是：

> 把 AI 变成研发流程里的自动化节点。

PR Review 是一个很适合开始的节点，因为输入和输出都足够明确，风险也可控。

这也是我做 `AI Dev Workflows` 这个系列的原因：不用空谈 AI 提效，而是一个真实工作流一个真实工作流地拆。

## 参与反馈

仓库地址：

```text
https://github.com/Eric2026-maker/ai-dev-workflows
```

如果你也想把 AI 接进自己的研发流程，可以在 GitHub issue 里告诉我你的场景。

我现在最想收集这几类反馈：

- 你最想自动化的是 Review、测试、需求拆解，还是文档？
- 你所在团队能不能接受 AI 读取代码 diff？
- 你希望 Review 结果输出到终端、PR 评论，还是飞书/Slack？
- 你愿不愿意试用这个 CLI，并给一个真实项目反馈？
