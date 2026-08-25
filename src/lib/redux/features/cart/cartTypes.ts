export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  icon: string;
  color: string;
  qty: number;
}

export interface CartState {
  items: CartItem[];
  lastOrderId: string | null;
  hydrated: boolean;
}
