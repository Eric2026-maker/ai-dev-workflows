# AI 写测试总翻车？我的做法是先让它列测试点

很多人用 AI 写单元测试，第一句话就是：

> 帮我给这段代码补测试。

然后结果经常不太靠谱：

- 编造不存在的测试框架
- 只测 happy path
- 漏掉真正危险的边界条件
- 生成一堆看起来很完整、但价值不高的测试
- 把业务规则猜错了

我的经验是：这不是单纯的模型能力问题，而是使用方式太粗。

更稳的方式不是直接让 AI 写测试代码，而是先让它回答一个更重要的问题：

> 这段代码到底应该测什么？

这篇文章用一个订单金额计算函数，演示一个更实用的 AI 测试生成工作流。

## 示例函数

假设项目里有这样一个函数：

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

这个函数看起来不复杂，但里面其实有不少测试风险：

- 商品小计
- 优惠券
- 会员折扣
- 包邮规则
- 金额不能为负
- 小数精度
- 缺失字段
- 异常输入

如果直接让 AI 写测试，它很可能只生成几个普通路径。

但真正容易出问题的，是组合条件。

## 不推荐的提问方式

我不建议这样问：

```text
帮我给这个函数写单元测试。
```

这个问题太宽了。

AI 不知道你关心什么，也不知道哪些路径必须覆盖。它只能按照常见模式生成几条测试，质量很不稳定。

## 推荐的工作流

我建议分三步：

```text
代码 -> 测试策略 -> 测试用例表 -> 测试骨架
```

也就是：

1. 先让 AI 分析风险路径。
2. 再让 AI 输出测试用例表。
3. 人确认测试点后，再生成测试代码。

核心原则是：

> 先测什么，再写代码。

## 第一步：让 AI 输出测试策略

可以这样问：

```text
你是一名擅长测试设计的高级工程师。

请先不要写测试代码。

请阅读下面的函数，先输出测试策略：

1. 这个函数的核心业务规则是什么？
2. 哪些输入组合最容易出错？
3. 哪些边界条件必须覆盖？
4. 哪些地方需要向业务确认？
5. 应该优先写哪些测试？

函数代码：

```js
// paste code here
```
```

注意，我明确说了：

> 先不要写测试代码。

这是关键。

你要先让 AI 做测试设计，而不是直接生成代码。

## 第二步：让 AI 输出测试用例表

接着让它输出一张表：

```markdown
| Case | Input/Setup | Expected Result | Why |
| --- | --- | --- | --- |
```

对于这个函数，测试用例应该类似这样：

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

这一步的价值很高。

因为测试用例表比测试代码更容易 Review。

你可以先确认：

- 有没有遗漏关键路径
- 业务规则是否被 AI 猜错
- 哪些问题需要问产品
- 哪些测试应该优先写

## 第三步：再生成测试骨架

确认测试点后，再让 AI 生成测试代码。

示例：

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
});
```

这时代码生成质量会明显更稳定。

因为 AI 已经有了明确的测试目标，而不是凭感觉补测试。

## 这个案例里发现的真实风险

这段代码里有一个值得注意的问题：

```js
const shippingFee = subtotal >= 99 ? 0 : order.shippingFee;
```

如果 `subtotal < 99`，但 `order.shippingFee` 没传，后面会发生什么？

```js
const total = discounted + shippingFee;
```

`shippingFee` 是 `undefined`，最终结果可能变成 `NaN`。

这就是测试设计的价值。

如果一开始只让 AI 写几个普通测试，它可能不会主动覆盖这个路径。

但如果你先要求它分析边界条件和异常输入，这个问题更容易暴露出来。

## 我的通用 Prompt

我把这个 prompt 放到了仓库里：

```text
templates/test-generation-prompt.md
```

核心结构是：

```text
你是一名擅长测试设计的高级工程师。
请根据下面的代码或 diff 设计测试用例。

目标：
- 覆盖正常路径
- 覆盖边界条件
- 覆盖错误输入
- 覆盖异常和失败分支
- 覆盖兼容性或回归风险

请先输出测试策略和测试用例表。
不要直接写完整测试代码。
```

我会强制要求 AI 输出：

- Test Strategy
- Test Cases
- Missing Context
- Example Test Skeleton

这几个部分能让 AI 的输出更可控。

## 适合哪些场景

这个工作流适合：

- 老项目补测试
- 重构前补保护性测试
- PR 前检查测试覆盖
- 复杂业务规则梳理
- 金额、权限、状态流转等高风险逻辑

尤其适合那种“函数不长，但规则很多”的代码。

例如：

- 价格计算
- 订单状态流转
- 权限判断
- 优惠活动
- 表单校验
- API 参数转换
- 数据清洗

## 不适合哪些场景

它不适合完全交给 AI 自动决定一切。

尤其是这些情况：

- 业务规则没有写清楚
- 测试框架不明确
- 依赖大量外部服务
- 输入输出没有稳定约定
- 涉及支付、权限、隐私等高风险逻辑

这些场景里，AI 可以帮你列问题，但最终判断必须由人确认。

## 总结

AI 写测试的正确姿势，不是：

> 帮我补测试。

而是：

> 先告诉我这段代码应该测什么。

我的建议是：

1. 先让 AI 读代码。
2. 让它输出测试策略。
3. 让它列测试用例表。
4. 人确认测试点。
5. 再让它生成测试骨架。

一句话：

> 先测什么，再写代码。

我把完整案例放到了 GitHub：

```text
https://github.com/Eric2026-maker/ai-dev-workflows/tree/main/examples/test-generation
```

后面我会继续整理更多 AI 编程自动化实战案例。
