# 用 AI 做一次线上报错排查：从日志到修复建议

很多程序员每天都会遇到这种情况：

> 群里突然有人说：线上接口报错了，你看一下。

然后你开始翻日志、找 traceId、看异常堆栈、猜用户操作路径、对比最近发布记录。

这类工作很消耗注意力，而且经常不是“难”，而是“乱”：

- 日志太长
- 关键字段分散
- 异常堆栈混在业务日志里
- 上下游调用链不清楚
- 同一个错误重复出现
- 不知道先查代码、配置、数据还是依赖服务

这篇文章演示一个更实用的 AI 工作流：

> 把原始日志交给 AI，让它先做结构化排查报告，而不是直接让它猜 bug。

## 为什么这个场景适合 AI

日志排查有几个特点：

1. 输入通常是半结构化文本。
2. 里面有大量噪音。
3. 人真正需要的是线索排序。
4. 输出可以由开发者快速验证。

AI 在这个场景里不应该扮演“最终判官”。

更合理的定位是：

> 帮你从混乱日志里提取关键信息，形成第一版排查路线。

这比直接问“这个错误怎么修”靠谱得多。

## 示例日志

假设线上出现了这样的日志：

```text
2026-06-03 10:21:33.418 ERROR [order-service] traceId=8f21c9 userId=10241 path=/api/orders/export
java.lang.NullPointerException: Cannot read field "amount" because "coupon" is null
  at com.example.order.ExportOrderService.buildExportRows(ExportOrderService.java:87)
  at com.example.order.ExportOrderService.export(ExportOrderService.java:42)
  at com.example.order.OrderController.exportOrders(OrderController.java:118)

2026-06-03 10:21:33.421 INFO [order-service] traceId=8f21c9 filter={status=PAID,startDate=2026-06-01,endDate=2026-06-03}
2026-06-03 10:21:33.426 WARN [order-service] traceId=8f21c9 couponId=null orderId=O202606030091
2026-06-03 10:21:33.431 ERROR [gateway] traceId=8f21c9 status=500 upstream=order-service cost=1832ms
```

如果只盯着异常，第一反应可能是：

> coupon 为空，加个判空。

但这只是最表层的修复。

真正要确认的问题更多：

- 为什么导出路径里会访问 coupon.amount？
- coupon 为空是不是合法业务场景？
- 只有导出接口报错，还是订单详情也报错？
- 这次是否和最近需求“导出 Excel”有关？
- 是否有批量数据导致错误被放大？
- 修复后要补哪些回归测试？

这就是 AI 可以帮忙整理的部分。

## 不推荐的提问方式

不建议直接这样问：

```text
这段日志是什么问题？怎么修？
```

这个问题太粗，AI 很容易给出一个看似合理但缺验证的答案。

比如它可能直接说：

> coupon 为空，增加空指针判断即可。

这个建议不是错，但不完整。

更好的问法是让 AI 输出排查报告，而不是直接输出结论。

## 推荐工作流

我建议把线上日志排查拆成 5 步：

```text
日志 -> 关键信息提取 -> 初步判断 -> 验证清单 -> 修复和测试建议
```

对应到 AI 任务：

1. 提取 traceId、服务名、接口、用户、时间、异常类型。
2. 找出最可能的触发路径。
3. 区分事实、推测和待验证项。
4. 给出排查优先级。
5. 输出修复建议和测试建议。

关键是第 3 点：

> 必须让 AI 区分“日志明确说明的事实”和“基于日志做出的推测”。

否则它很容易编故事。

## 可复用 Prompt

我在仓库里放了一个模板：

```text
templates/log-triage-prompt.md
```

你可以把日志粘进去，然后要求 AI 按这个结构输出：

```markdown
## Incident Summary

## Facts From Logs

## Most Likely Cause

## What To Verify Next

## Suggested Fix

## Tests To Add

## Risk And Rollback Notes
```

这几个字段的价值不一样。

`Facts From Logs` 用来约束 AI 不要乱猜。

`What To Verify Next` 用来指导开发者下一步查什么。

`Tests To Add` 用来把这次事故沉淀成回归测试。

`Risk And Rollback Notes` 用来提醒你不要只修 happy path。

## 一次更好的输出

对于上面的日志，一个比较好的 AI 输出应该类似这样：

```markdown
## Incident Summary

订单导出接口 `/api/orders/export` 在处理 traceId `8f21c9` 时返回 500。
异常发生在 `ExportOrderService.buildExportRows`，原因是代码读取了空 coupon 的 amount 字段。

## Facts From Logs

- 服务：order-service
- 接口：/api/orders/export
- 用户：10241
- traceId：8f21c9
- 异常类型：NullPointerException
- 位置：ExportOrderService.java:87
- 相关字段：couponId=null，orderId=O202606030091

## Most Likely Cause

导出逻辑默认订单一定存在 coupon，但日志显示至少有一笔订单 couponId 为空。
如果无优惠券订单是合法数据，则导出逻辑缺少空值处理。

## What To Verify Next

- 确认无 coupon 的订单是否是合法业务状态。
- 检查订单详情、列表和导出是否使用不同 DTO 组装逻辑。
- 查看最近是否修改过导出字段或优惠券字段。
- 查询同一时间窗口内是否有更多 traceId 出现相同异常。

## Suggested Fix

- 在导出行组装时显式处理无优惠券订单。
- 不要只做简单判空，还要确认导出字段展示规则，例如空字符串、0 或“无优惠券”。

## Tests To Add

- 无优惠券订单可以正常导出。
- 有优惠券订单导出 coupon amount 正确。
- 混合订单批量导出不会中断整个导出任务。
- coupon 字段缺失时不会返回 500。
```

这样的输出比一句“加判空”有用得多。

因为它不仅给了修复方向，还给了验证路线。

## 可以做成脚本的地方

这个工作流很适合继续自动化。

最小版本可以这样做：

```text
logs/error.log -> log triage prompt -> AI report -> triage.md
```

进一步可以接入：

- Sentry
- ELK / Kibana
- Loki / Grafana
- 云厂商日志服务
- 飞书或 Slack 告警
- GitHub Issue

比如：

```text
线上告警 -> 拉取最近 10 分钟日志 -> AI 生成排查报告 -> 发到群里 -> 人确认修复
```

这不是让 AI 自动修线上问题。

而是让 AI 在事故开始的前几分钟，先帮你把线索整理出来。

## 注意事项

这个场景有几个边界：

1. 不要把敏感用户信息直接发给外部模型。
2. 不要让 AI 根据一段日志直接下最终结论。
3. 不要让 AI 自动执行修复命令。
4. 不要忽略监控指标和最近发布记录。
5. 不要只修异常点，还要补回归测试。

如果日志里有手机号、邮箱、token、订单金额等敏感信息，应该先脱敏。

可以把：

```text
userId=10241 phone=13800000000 token=abc123
```

处理成：

```text
userId=<USER_ID> phone=<PHONE> token=<TOKEN>
```

再交给 AI。

## 适合沉淀成团队模板

这个案例最值得沉淀的不是某一次排查结论，而是排查结构。

团队可以统一要求 AI 输出：

- 事实
- 推测
- 待验证项
- 修复建议
- 测试建议
- 回滚风险

这样每次线上问题复盘时，信息格式都更稳定。

久而久之，这会变成团队自己的事故排查模板。

## 结论

AI 在日志排查里最有价值的地方，不是替你拍脑袋判断根因。

更实用的用法是：

> 把混乱日志变成结构化排查报告。

这个节点非常适合程序员日常使用，因为它不要求 AI 直接改线上代码，也不要求它完全理解整个系统。

它只需要先完成一件事：

> 帮你更快看清楚，下一步应该查哪里。

