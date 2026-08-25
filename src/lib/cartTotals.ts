import type { CartItem } from "@/src/lib/redux/features/cart/cartTypes";

export const FREE_DELIVERY_THRESHOLD = 999;
export const DELIVERY_FEE = 60;

export function getCartTotals(items: CartItem[]) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery = subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery;
  return { subtotal, delivery, total };
}
