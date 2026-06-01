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
