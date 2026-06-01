# 使用说明：AI 测试生成工作流

这个文档说明如何使用 `examples/test-generation` 里的案例。

目标不是让 AI 直接替你写完测试，而是建立一个更稳定的流程：

```text
代码 -> 测试策略 -> 测试用例表 -> 测试骨架 -> 人工补齐
```

## 适用场景

适合：

- 给旧代码补单元测试
- 重构前补保护性测试
- 给 PR 增加测试建议
- 分析业务逻辑的边界条件
- 检查金额、权限、状态机等高风险函数

不适合：

- 完全不理解业务就让 AI 生成最终测试
- 让 AI 猜测支付、权限、隐私相关规则
- 没有人 Review AI 输出

## 文件结构

```text
examples/test-generation/
  README.md
  USAGE.md
  price-calculator.js
  test-cases.md
```

文件说明：

- `price-calculator.js`：示例业务函数
- `test-cases.md`：推荐的测试设计输出
- `USAGE.md`：当前使用说明

## 第 1 步：准备代码

示例函数：

```js
export function calculateOrderTotal(order) {
  const subtotal = order.items.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);

  const couponDiscount = order.coupon?.amount || 0;
  const memberDiscountRate = order.memberLevel === 'vip' ? 0.9 : 1;
  const shippingFee = subtotal >= 99 ? 0 : order.shippingFee;

  const discounted = (subtotal - couponDiscount) * memberDiscountRate;
  const total = discounted + shippingFee;

  return Math.max(0, Number(total.toFixed(2)));
}
```

如果用于你自己的项目，把目标函数或 diff 复制出来即可。

建议优先选择：

- 规则明确
- 输入输出清楚
- 有多个分支
- 容易出现边界问题

## 第 2 步：不要直接让 AI 写测试

不要这样问：

```text
帮我给这段代码写测试。
```

这个请求太粗，AI 往往会直接生成测试代码，但漏掉关键路径。

## 第 3 步：先让 AI 做测试设计

推荐使用仓库里的 prompt：

```text
templates/test-generation-prompt.md
```

也可以直接使用下面这个精简版：

```text
你是一名擅长测试设计的高级工程师。

请根据下面的代码设计测试用例。

要求：
1. 先不要写完整测试代码。
2. 先总结这个函数的核心业务规则。
3. 列出最容易出错的输入组合。
4. 列出必须覆盖的边界条件。
5. 输出测试用例表。
6. 标出哪些地方需要向业务确认。

输出格式：

## Test Strategy

## Test Cases

| Case | Input/Setup | Expected Result | Why |
| --- | --- | --- | --- |

## Missing Context

## Example Test Skeleton

代码如下：

```js
// paste code here
```
```

## 第 4 步：检查 AI 的测试用例表

AI 应该输出类似这样的内容：

| Case | Input/Setup | Expected Result | Why |
| --- | --- | --- | --- |
| 普通订单 | subtotal 50，无优惠券，非会员，shippingFee 10 | total 60 | 基础路径 |
| 满 99 包邮 | subtotal 120，无优惠券，shippingFee 10 | total 120 | 验证包邮规则 |
| VIP 折扣 | subtotal 100，vip，无优惠券 | total 90 | 验证会员折扣 |
| 优惠券 + VIP | subtotal 100，coupon 20，vip | total 72 | 验证组合顺序 |
| 优惠券大于金额 | subtotal 30，coupon 100，shippingFee 10 | total 0 | 防止负数 |
| 小数金额 | price 19.99，quantity 3 | 保留 2 位小数 | 验证精度 |
| 空 items | items 为空数组 | 根据业务决定 0 或抛错 | 需要确认业务规则 |
| 缺少 shippingFee | subtotal 小于 99，shippingFee 缺失 | 应明确处理 | 当前代码可能返回 NaN |

人工 Review 时重点看：

- 是否覆盖核心业务规则
- 是否覆盖组合条件
- 是否覆盖异常输入
- 是否有 AI 猜测业务规则
- 是否有需要问产品的问题
- 是否遗漏高风险路径

## 第 5 步：确认业务规则

在这个案例里，至少需要确认：

1. `items` 为空时应该返回 0，还是抛错？
2. `shippingFee` 缺失时默认 0，还是应该报错？
3. 优惠券是否应该先于会员折扣计算？
4. 优惠券金额大于小计时，运费是否还应该计算？
5. 金额精度是否统一保留两位？

这些问题不能让 AI 自己决定。

## 第 6 步：再生成测试骨架

确认测试用例后，再让 AI 生成测试代码。

示例：

```text
根据上面的测试用例表，生成 Jest 测试骨架。

要求：
1. 不要引入不存在的依赖。
2. 每个测试名清晰描述业务场景。
3. 对需要业务确认的用例，用 test.todo 标记。
4. 不要隐藏 NaN 风险。
```

示例输出：

```js
import { calculateOrderTotal } from './price-calculator.js';

describe('calculateOrderTotal', () => {
  test('calculates normal order with shipping fee', () => {
    const total = calculateOrderTotal({
      items: [{ price: 50, quantity: 1 }],
      shippingFee: 10
    });

    expect(total).toBe(60);
  });

  test('applies free shipping when subtotal reaches 99', () => {
    const total = calculateOrderTotal({
      items: [{ price: 120, quantity: 1 }],
      shippingFee: 10
    });

    expect(total).toBe(120);
  });

  test('prevents negative total when coupon exceeds subtotal', () => {
    const total = calculateOrderTotal({
      items: [{ price: 30, quantity: 1 }],
      coupon: { amount: 100 },
      shippingFee: 10
    });

    expect(total).toBe(0);
  });

  test.todo('defines behavior when shippingFee is missing and subtotal is below 99');
});
```

## 第 7 步：修复代码风险

这个案例里，`shippingFee` 缺失可能导致 `NaN`。

一个可能的修复是：

```js
const shippingFee = subtotal >= 99 ? 0 : (order.shippingFee ?? 0);
```

但这只是技术修复。

是否默认 0，必须看业务规则。

## 第 8 步：把流程用于真实项目

真实项目里可以这样用：

1. 找一个高风险函数。
2. 复制函数代码或 `git diff`。
3. 使用 `templates/test-generation-prompt.md`。
4. 让 AI 输出测试策略和测试用例表。
5. 人工确认业务规则。
6. 再让 AI 生成测试骨架。
7. 本地运行测试。
8. 根据失败结果继续让 AI 协助修正。

## 检查清单

提交测试前确认：

- [ ] 是否覆盖正常路径
- [ ] 是否覆盖边界条件
- [ ] 是否覆盖错误输入
- [ ] 是否覆盖组合条件
- [ ] 是否覆盖精度问题
- [ ] 是否标注业务不确定点
- [ ] 是否没有让 AI 编造依赖
- [ ] 是否本地跑过测试

## 关键原则

不要把 AI 当成测试工程师的替代品。

更好的定位是：

> AI 负责帮你列风险、补视角、生成骨架；人负责确认业务规则和最终质量。
