# AI Dev Workflows

真实项目里的 AI 编程与自动化实战。

这个仓库用于沉淀一套可复用的 AI 研发工作流：

> 我用真实项目演示：程序员如何用 AI 工具、自动化脚本和工程化方法提升开发效率，并把过程沉淀成可复用模板。

## 目标受众

- 想系统使用 AI 编程工具的程序员
- 想把 AI 接入研发流程的小团队
- 想提升代码 Review、测试、文档和需求拆解效率的技术负责人
- 想做 AI 自动化副业的开发者

## 仓库内容

- `content/`：AI 研发工作流实践文章
- `content/social-posts/`：技术内容分发素材
- `templates/`：可复用 prompt 和工作流模板
- `tools/git-diff-review/`：最小版 Git diff AI Review CLI
- `workflows/`：GitHub Actions、n8n 等自动化示例

## 技术路线

当前优先沉淀这些研发节点：

1. PR Review
2. 测试生成
3. 需求拆解
4. README 和技术文档生成
5. CI / GitHub Actions 自动化
6. 日志排查和线上问题 triage
7. API 测试用例生成

## 内容主题

1. 我用 AI 做了一个 PR Review 工作流
2. 用 AI 从需求直接拆任务和验收标准
3. 用 AI 给旧代码补测试用例
4. 用脚本把重复的开发检查自动化
5. 我如何把 AI 编程过程沉淀成团队模板
6. 用 AI 把线上日志整理成排查报告
7. 用 AI 把接口文档变成测试用例清单

## 当前可执行入口

GitHub 仓库：

```text
https://github.com/Eric2026-maker/ai-dev-workflows
```

先进入工具目录：

```bash
cd tools/git-diff-review
```

只生成 Review Prompt，不调用 API：

```bash
node bin/ai-diff-review.mjs --prompt-only --cached
```

调用 OpenAI API：

```bash
set OPENAI_API_KEY=你的 key
node bin/ai-diff-review.mjs --cached
```

macOS/Linux：

```bash
export OPENAI_API_KEY=你的 key
node bin/ai-diff-review.mjs --cached
```

## 内容原则

- 每篇内容必须解决一个真实工程问题。
- 每篇内容必须附带源码、模板或检查清单。
- 不做 AI 新闻搬运，不做泛泛工具介绍。
- 输出要能被读者复制到自己的项目里使用。

## 参与反馈

如果你也想把 AI 接入自己的研发流程，可以提交 issue 描述你的场景：

- 你最想自动化哪个环节？
- 当前流程里最浪费时间的动作是什么？
- 你希望 AI 输出什么格式的结果？
- 是否适合做成 CLI、GitHub Action 或团队模板？

我会优先把反复出现的场景做成公开 demo。
