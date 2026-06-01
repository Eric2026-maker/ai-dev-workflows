# Test Cases

## Test Strategy

这个函数的风险不在普通路径，而在金额组合规则：

- 商品小计
- 优惠券
- 会员折扣
- 包邮规则
- 金额不能为负
- 小数精度
- 输入结构异常

AI 应该先列测试用例，再生成测试代码。

## Test Case Matrix

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

## Example Test Skeleton

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

## Important Finding

这段代码里有一个真实风险：

```js
const shippingFee = subtotal >= 99 ? 0 : order.shippingFee;
```

当 `subtotal < 99` 且 `order.shippingFee` 缺失时，`total` 可能变成 `NaN`。

这就是为什么先让 AI 做测试设计，比直接生成测试代码更有价值。
