export interface CartItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  qty: number;
}

export interface CartState {
  items: CartItem[];
  lastOrderId: string | null;
  hydrated: boolean;
}
