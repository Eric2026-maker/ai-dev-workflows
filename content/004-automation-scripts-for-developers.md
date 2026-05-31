# 程序员应该把哪些重复检查交给脚本

## 开头

很多开发效率问题不是因为写代码慢，而是因为每天重复做一堆低价值检查：

- 提交前忘记格式化
- 改了接口忘记更新文档
- 改了配置忘记检查环境变量
- 发版前漏掉 changelog
- Review 时反复提醒同样的问题

这些事情不应该一直靠人记。

这篇文章整理一套适合程序员的自动化检查清单。

## 判断一个任务是否值得自动化

满足 3 个条件就值得自动化：

1. 每周重复出现。
2. 出错会造成返工。
3. 判断规则相对固定。

比如代码格式化、依赖检查、提交信息检查、diff Review、测试提醒，都符合。

## 第一批可以自动化的节点

### 1. 提交前检查

- lint
- format
- type check
- unit tests
- commit message check

### 2. PR 前检查

- diff summary
- AI first-pass review
- missing tests check
- changed files checklist

### 3. 发版前检查

- changelog
- version bump
- migration check
- environment variables
- rollback notes

### 4. 文档同步

- README 是否需要更新
- API 文档是否变化
- 配置说明是否变化
- 示例代码是否过期

## AI 适合放在哪些位置

AI 不适合负责确定性检查，比如格式化和类型检查。

它更适合处理半结构化任务：

- 总结 diff
- 发现潜在风险
- 生成测试建议
- 根据代码变化提醒文档更新
- 把报错日志整理成排查步骤

规则是：

> 能用脚本确定的，就不要用 AI；需要经验判断的，再让 AI 参与。

## 自动化脚本检查清单

我把通用检查项放在：

```text
templates/automation-script-checklist.md
```

每次做自动化前先回答：

- 输入是什么？
- 输出给谁？
- 是否有 dry-run？
- 是否可能泄露敏感信息？
- 失败后怎么处理？
- 是否需要人工确认？

这些问题能避免很多“脚本自动闯祸”的情况。

## 最小实践

可以从一个很简单的命令开始：

```bash
npm run check
```

背后做这些事：

```text
lint -> typecheck -> test -> AI diff review prompt
```

前面是确定性检查，最后是 AI 辅助检查。

## 结论

程序员的 AI 自动化不应该追求炫技。

它应该优先解决这些重复、容易漏、出错有代价的流程。

先把每天重复 3 次的动作自动化掉，再谈更复杂的 agent。
