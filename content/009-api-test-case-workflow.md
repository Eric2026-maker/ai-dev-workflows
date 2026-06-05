# 用 AI 把接口文档变成测试用例：从需求到可执行请求清单

很多后端和全栈程序员都会遇到一个很常见的问题：

> 接口写完了，文档也有了，但测试用例总是最后才补。

结果就是：

- 正常请求测了，异常参数没测
- 必填字段测了，边界值没测
- 单接口测了，状态流转没测
- 文档写了成功响应，没写错误响应
- 联调时才发现前端传参和后端预期不一致
- 上线后才发现某些历史数据、空值、权限场景没有覆盖

这类问题不一定是开发者不会测。

更常见的原因是：

> 从接口文档到测试用例，中间缺一个结构化转换步骤。

这篇文章演示一个很实用的 AI 工作流：

> 把接口文档、需求说明或 Controller 代码交给 AI，让它生成 API 测试用例清单、请求样例和断言建议。

## 为什么这个场景适合 AI

API 测试用例生成很适合让 AI 参与，原因有三个。

第一，输入通常比较结构化。

接口路径、请求方法、参数、响应字段、错误码、权限说明，这些信息天然适合被整理。

第二，输出格式可以强约束。

我们不需要 AI 自由发挥，而是要求它输出：

- 用例名称
- 请求方法和路径
- 请求参数
- 前置条件
- 期望响应
- 断言点
- 优先级
- 是否适合自动化

第三，结果很容易由开发者验证。

AI 生成的测试用例不是最终真理，而是一版覆盖清单。

开发者可以很快判断：

- 哪些用例有价值
- 哪些用例缺业务上下文
- 哪些用例可以直接放进 Postman、Apifox 或自动化测试

## 示例接口

假设我们有一个订单导出接口：

```text
POST /api/orders/export

Description:
Export paid orders in a date range.

Headers:
Authorization: Bearer <token>

Request Body:
{
  "status": "PAID",
  "startDate": "2026-06-01",
  "endDate": "2026-06-03",
  "includeCoupon": true
}

Rules:
- Only logged-in users can export orders.
- startDate and endDate are required.
- The date range cannot exceed 31 days.
- status only supports PAID, REFUNDED, CANCELLED.
- If includeCoupon is true, coupon fields should be included in each row.
- Empty result should return an empty file, not 500.

Success Response:
200 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

Error Response:
400 INVALID_DATE_RANGE
401 UNAUTHORIZED
403 FORBIDDEN
```

如果让开发者手写测试，很容易只写出这几个：

- 正常导出成功
- 未登录返回 401
- 日期为空返回 400

但真实项目里还应该考虑更多场景。

比如：

- startDate 晚于 endDate
- 时间范围刚好 31 天
- 时间范围超过 31 天
- status 是不支持的枚举
- includeCoupon 为 true 但订单没有优惠券
- 查询结果为空
- 当前用户没有导出权限
- 导出文件内容字段是否完整
- 批量数据是否会超时

这就是 AI 可以帮忙补全的地方。

## 不推荐的提问方式

不建议直接这样问：

```text
帮我给这个接口生成测试用例。
```

这个问题太宽。

AI 很可能只给出一些泛泛的测试点：

- 正常场景
- 异常场景
- 权限场景
- 边界场景

这些当然没错，但不够可执行。

更好的方式是要求 AI 输出一份可以落地的测试表。

## 推荐工作流

我建议把这个过程拆成 6 步：

```text
接口文档 -> 参数识别 -> 业务规则提取 -> 测试矩阵 -> 请求样例 -> 自动化建议
```

对应到 AI 任务：

1. 提取接口路径、方法、认证方式、请求体、响应类型。
2. 识别必填字段、枚举字段、范围限制和权限规则。
3. 区分正常场景、异常场景、边界场景和权限场景。
4. 输出测试用例表格。
5. 为关键用例生成请求样例。
6. 标记哪些用例适合自动化，哪些需要人工验证。

关键点是：

> 不要只让 AI 生成测试点，要让它生成可执行的测试输入和断言。

## 可复用 Prompt

我在仓库里放了一个模板：

```text
templates/api-test-case-prompt.md
```

你可以把接口文档、OpenAPI 片段、Apifox 文档、Controller 代码或需求说明粘进去，然后要求 AI 输出：

```markdown
## API Summary

## Extracted Rules

## Test Case Matrix

## Request Examples

## Assertions

## Automation Suggestions

## Missing Information
```

这几个字段的作用不一样。

`Extracted Rules` 用来确认 AI 有没有正确理解接口规则。

`Test Case Matrix` 用来生成覆盖清单。

`Request Examples` 用来直接复制到 Postman、Apifox、curl 或自动化测试里。

`Missing Information` 用来暴露文档缺口。

很多接口测试漏测，不是因为测试人员粗心，而是因为文档没有写清楚。

AI 把缺口列出来，反而能推动接口文档补全。

## 一次更好的输出

对于上面的订单导出接口，一个比较好的输出应该类似这样：

````markdown
## API Summary

- Method: POST
- Path: /api/orders/export
- Auth: Bearer token required
- Main purpose: export orders by status and date range
- Response type: Excel file

## Extracted Rules

- startDate is required.
- endDate is required.
- Date range must not exceed 31 days.
- status only supports PAID, REFUNDED, CANCELLED.
- includeCoupon controls whether coupon fields appear in exported rows.
- Empty query result should still return a valid empty file.

## Test Case Matrix

| ID | Scenario | Input | Expected Result | Priority | Automation |
| --- | --- | --- | --- | --- | --- |
| TC-001 | Valid paid order export | status=PAID, valid 3-day range | 200, Excel file returned | P0 | Yes |
| TC-002 | Missing token | no Authorization header | 401 UNAUTHORIZED | P0 | Yes |
| TC-003 | Missing startDate | endDate only | 400 validation error | P0 | Yes |
| TC-004 | Missing endDate | startDate only | 400 validation error | P0 | Yes |
| TC-005 | startDate after endDate | startDate=2026-06-03, endDate=2026-06-01 | 400 INVALID_DATE_RANGE | P0 | Yes |
| TC-006 | Date range equals 31 days | valid 31-day range | 200 | P1 | Yes |
| TC-007 | Date range exceeds 31 days | 32-day range | 400 INVALID_DATE_RANGE | P0 | Yes |
| TC-008 | Unsupported status | status=CREATED | 400 validation error | P0 | Yes |
| TC-009 | Empty result | valid range but no orders | 200, valid empty file | P1 | Yes |
| TC-010 | includeCoupon true with no coupon orders | includeCoupon=true | 200, coupon fields empty or default | P1 | Yes |
| TC-011 | User without export permission | valid token but no permission | 403 FORBIDDEN | P0 | Yes |
| TC-012 | Large export volume | valid range with many orders | 200 or async handling according to design | P2 | Partial |

## Request Examples

Valid request:

```json
{
  "status": "PAID",
  "startDate": "2026-06-01",
  "endDate": "2026-06-03",
  "includeCoupon": true
}
```

Invalid date range:

```json
{
  "status": "PAID",
  "startDate": "2026-06-03",
  "endDate": "2026-06-01",
  "includeCoupon": true
}
```

## Assertions

- HTTP status code is correct.
- Error code matches documented response.
- Excel response content type is correct.
- Empty result still returns a valid file.
- Rows with no coupon do not cause 500 errors.

## Missing Information

- The exact error response body is not documented.
- Export permission rules are not described.
- Expected Excel columns are not listed.
- Large export behavior is unclear.
````

这样的结果比一句“生成测试用例”更有用。

因为它把测试用例、请求数据、断言点和文档缺口都列出来了。

## 可以继续自动化的地方

这个工作流很适合继续做成脚本。

最小版本可以这样做：

```text
api-doc.md -> API test case prompt -> api-test-cases.md
```

进一步可以接入：

- OpenAPI / Swagger JSON
- Apifox 导出的 Markdown
- Postman Collection
- Jest / Vitest / pytest
- REST Assured
- GitHub Actions
- CI 中的接口变更检查

比如：

```text
接口文档变更 -> AI 生成测试用例 diff -> 开发者确认 -> 生成 Postman Collection 草稿
```

或者：

```text
Controller 代码变更 -> AI 检查是否缺少异常用例 -> PR Review 留言
```

这个方向非常适合团队落地。

因为它不是让 AI 直接替你测试，而是让 AI 先把测试覆盖面摊开。

## 注意事项

这个场景也有边界。

1. 不要把 AI 生成的用例当成最终测试方案。
2. 不要忽略真实业务状态和历史数据。
3. 不要只验证 HTTP 状态码，还要验证业务错误码和响应内容。
4. 文件导出、异步任务、权限校验这类接口，要补人工验证或集成测试。
5. 如果接口文档缺失关键规则，应该让 AI 标出来，而不是让它猜。

尤其要注意：

> AI 很容易把“常见设计”当成“当前系统事实”。

所以 prompt 里必须要求它：

- 不要编造未提供的字段
- 不要编造未提供的错误码
- 不要编造未提供的权限规则
- 不确定时写到 Missing Information

## 适合沉淀成团队模板

这个案例最适合沉淀成团队的接口提测模板。

每次接口进入联调前，都可以要求输出：

- 接口摘要
- 规则提取
- 测试用例矩阵
- 请求样例
- 断言点
- 文档缺口

这样做的好处是：

- 开发能提前发现文档没写清楚的地方
- 测试能更快补覆盖
- 前端能提前看到异常响应
- Code Review 能检查接口是否可测
- 团队能把高频漏测点沉淀下来

## 结论

AI 在接口测试里的价值，不是替你点按钮测接口。

更实用的用法是：

> 把接口文档变成可执行的测试用例清单。

这个节点非常适合程序员日常使用，因为它不依赖复杂平台，也不要求一开始就接入完整自动化测试体系。

你只需要先完成一件事：

> 在接口提测前，让 AI 帮你把正常、异常、边界、权限和文档缺口都列出来。

这就是一个很容易落地的 AI 开发工作流。
