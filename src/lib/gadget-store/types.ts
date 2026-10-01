import type { Gadget } from "@/src/data/gadgets";

export type Product = Gadget & { cost: number; stock: number; active: boolean };

export type Category = { id: string; name: string };
export type Brand = { id: string; name: string };

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  joinedAt: string;
  avatar?: string;
};

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "bkash" | "nagad" | "card" | "emi" | "cash" | "bank";

export type OrderLine = {
  productId: string;
  name: string;
  image: string;
  price: number;
  cost: number;
  qty: number;
  variant?: string;
};

export type Order = {
  id: string;
  createdAt: string;
  customerId: string;
  customer: Omit<Customer, "id" | "joinedAt">;
  items: OrderLine[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paid: number;
  paymentMethod: PaymentMethod;
  type: "regular" | "preorder";
  releaseDate?: string;
  status: OrderStatus;
  timeline: { status: OrderStatus; at: string; note?: string }[];
  note?: string;
};

export type Memo = {
  id: string;
  createdAt: string;
  customerName: string;
  customerPhone: string;
  items: OrderLine[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  paymentMethod: PaymentMethod;
  soldBy: string;
  note?: string;
};

export type ExpenseCategory = "Rent" | "Salary" | "Utility" | "Marketing" | "Purchase" | "Transport" | "Other";

export type Expense = {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note: string;
};

export type ChatMessage = { id: string; from: "customer" | "admin"; text: string; at: string };

export type ChatThread = {
  id: string;
  customerId: string;
  customerName: string;
  messages: ChatMessage[];
  adminUnread: number;
  customerUnread: number;
  updatedAt: string;
};

export type CartLine = { key: string; productId: string; qty: number; variant?: string };

export type GadgetDB = {
  version: number;
  seeded: boolean;
  products: Product[];
  categories: Category[];
  brands: Brand[];
  customers: Customer[];
  currentUserId: string;
  orders: Order[];
  memos: Memo[];
  expenses: Expense[];
  chats: ChatThread[];
  cart: CartLine[];
  wishlist: string[];
  seq: { order: number; memo: number; product: number };
};
