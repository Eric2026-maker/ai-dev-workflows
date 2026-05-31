# 我如何把 AI 编程过程沉淀成团队模板

## 开头

很多人用 AI 编程有一个问题：

今天问得好，输出就好；明天问得随意，输出就乱。

这说明你依赖的是“临场发挥”，不是“工程流程”。

我更推荐把 AI 编程过程沉淀成模板。

## 为什么要模板化

模板化的价值有三个：

1. 降低每次使用 AI 的思考成本。
2. 让团队成员输出风格更一致。
3. 把经验变成可复用资产。

对个人来说，这是效率工具。  
对团队来说，这是工程规范。

## 最值得沉淀的 5 类模板

### 1. PR Review 模板

用于代码提交前自查和 Review。

对应文件：

```text
templates/pr-review-prompt.md
```

### 2. 测试生成模板

先设计测试点，再生成测试骨架。

对应文件：

```text
templates/test-generation-prompt.md
```

### 3. 需求拆解模板

把一句需求拆成验收标准和工程任务。

对应文件：

```text
templates/requirements-breakdown-prompt.md
```

### 4. README 生成模板

把项目说明变成清晰文档。

对应文件：

```text
templates/readme-generator-prompt.md
```

### 5. 自动化脚本检查清单

避免脚本不受控地处理敏感数据或线上操作。

对应文件：

```text
templates/automation-script-checklist.md
```

## 好模板的结构

一个好模板通常包括：

- 角色：你希望 AI 以什么身份工作
- 目标：这次任务到底要产出什么
- 输入：提供哪些上下文
- 输出格式：最好固定成 Markdown、表格或 JSON
- 限制：哪些事情不能做
- 质量标准：什么算好结果

如果没有输出格式，AI 很容易发散。  
如果没有限制，AI 很容易编造。

## 团队如何使用

不要把模板散落在聊天记录里。

更好的方式是放进仓库：

```text
templates/
  pr-review-prompt.md
  test-generation-prompt.md
  requirements-breakdown-prompt.md
```

然后在 README 里写清楚什么时候用。

进一步可以做成 CLI：

```bash
ai-workflow review --cached
ai-workflow test --file src/foo.ts
ai-workflow requirement --file requirement.md
```

## 结论

AI 编程真正值得积累的不是某一次神奇回答。

而是：

> 把有效提问、团队规范和工程经验沉淀成可复用模板。

这也是 AI 编程从个人技巧变成团队能力的关键。
