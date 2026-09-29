import { gadgets } from "@/src/data/gadgets";
import { enrichGadget, seedCategories } from "@/src/data/gadgetDetails";
import type {
  ChatThread,
  Customer,
  Expense,
  ExpenseCategory,
  GadgetDB,
  Memo,
  Order,
  OrderLine,
  OrderStatus,
  PaymentMethod,
  Product,
} from "./types";

export const DB_VERSION = 4;
export const DEMO_USER_ID = "cu1";

const products: Product[] = gadgets.map((g) => {
  const e = enrichGadget(g);
  return { ...e, stock: e.stock ?? 0, active: e.active ?? true, cost: Math.round((e.price * 0.86) / 10) * 10 };
});

const brands = [...new Set(products.map((p) => p.brand))].sort().map((name, i) => ({ id: `b${i + 1}`, name }));

/** Catalog-only state: identical on server and first client render, so hydration is stable. */
export const catalogState: GadgetDB = {
  version: DB_VERSION,
  seeded: false,
  products,
  categories: seedCategories.map((name, i) => ({ id: `c${i + 1}`, name })),
  brands,
  customers: [],
  currentUserId: DEMO_USER_ID,
  orders: [],
  memos: [],
  expenses: [],
  chats: [],
  cart: [],
  wishlist: [],
  seq: { order: 10000, memo: 1000, product: products.length },
};

// Deterministic PRNG so the demo history looks the same for everyone.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const customerSeed: Omit<Customer, "joinedAt">[] = [
  { id: DEMO_USER_ID, name: "Rahim Ahmed", phone: "01712-345678", email: "rahim.ahmed@example.com", address: "House 12, Road 5, Dhanmondi", city: "Dhaka" },
  { id: "cu2", name: "Farhana Akter", phone: "01819-223344", email: "farhana@example.com", address: "Sector 7, Uttara", city: "Dhaka" },
  { id: "cu3", name: "Mahmudul Hasan", phone: "01911-556677", email: "mahmud@example.com", address: "GEC Circle", city: "Chattogram" },
  { id: "cu4", name: "Sadia Islam", phone: "01521-889900", email: "sadia@example.com", address: "Zindabazar", city: "Sylhet" },
  { id: "cu5", name: "Tanvir Rahman", phone: "01611-112233", email: "tanvir@example.com", address: "Mirpur 10", city: "Dhaka" },
  { id: "cu6", name: "Nabila Chowdhury", phone: "01755-667788", email: "nabila@example.com", address: "Gulshan 2", city: "Dhaka" },
  { id: "cu7", name: "Imran Hossain", phone: "01312-445566", email: "imran@example.com", address: "Shaheb Bazar", city: "Rajshahi" },
  { id: "cu8", name: "Riya Das", phone: "01877-990011", email: "riya@example.com", address: "Boyra", city: "Khulna" },
  { id: "cu9", name: "Arafat Karim", phone: "01722-334455", email: "arafat@example.com", address: "Bashundhara R/A", city: "Dhaka" },
  { id: "cu10", name: "Mitu Begum", phone: "01933-221100", email: "mitu@example.com", address: "Kandirpar", city: "Cumilla" },
];

const line = (p: Product, qty = 1, variant?: string): OrderLine => ({
  productId: p.id,
  name: p.name,
  image: p.image,
  price: p.price,
  cost: p.cost,
  qty,
  variant,
});

const flow: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered"];

function timelineUntil(status: OrderStatus, created: number) {
  if (status === "cancelled") {
    return [
      { status: "pending" as const, at: new Date(created).toISOString() },
      { status: "cancelled" as const, at: new Date(created + 5 * 3600e3).toISOString(), note: "Cancelled by customer" },
    ];
  }
  const upto = flow.indexOf(status);
  return flow.slice(0, upto + 1).map((s, i) => ({ status: s, at: new Date(created + i * 14 * 3600e3).toISOString() }));
}

/** Full demo dataset, generated on the client relative to "now". */
export function createSeed(now = Date.now()): GadgetDB {
  const rand = rng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)];
  const day = 86400e3;
  const inStock = products.filter((p) => !p.preOrder);
  const byId = (slug: string) => products.find((p) => p.slug === slug)!;

  const customers: Customer[] = customerSeed.map((c, i) => ({
    ...c,
    joinedAt: new Date(now - (120 - i * 9) * day).toISOString(),
  }));

  let orderSeq = 10000;
  const orders: Order[] = [];
  const makeOrder = (
    c: Customer,
    items: OrderLine[],
    created: number,
    status: OrderStatus,
    method: PaymentMethod,
    extra: Partial<Order> = {}
  ): Order => {
    const subtotal = items.reduce((s, l) => s + l.price * l.qty, 0);
    const deliveryFee = subtotal >= 20000 ? 0 : c.city === "Dhaka" ? 80 : 150;
    const total = subtotal + deliveryFee;
    const paid = status === "delivered" || method !== "cod" ? total : 0;
    return {
      id: `GH-${++orderSeq}`,
      createdAt: new Date(created).toISOString(),
      customerId: c.id,
      customer: { name: c.name, phone: c.phone, email: c.email, address: c.address, city: c.city },
      items,
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      paid: status === "cancelled" ? 0 : paid,
      paymentMethod: method,
      type: "regular",
      status,
      timeline: timelineUntil(status, created),
      ...extra,
    };
  };

  // Random history for the dashboard.
  for (let i = 0; i < 48; i++) {
    const age = Math.floor(rand() * 30);
    const created = now - age * day - Math.floor(rand() * 10) * 3600e3;
    const c = customers[1 + Math.floor(rand() * (customers.length - 1))];
    const n = rand() < 0.7 ? 1 : 2;
    const items = Array.from({ length: n }, () => line(pick(inStock), rand() < 0.85 ? 1 : 2));
    const status: OrderStatus =
      age > 6 ? (rand() < 0.9 ? "delivered" : "cancelled") : age > 2 ? pick(["shipped", "delivered", "processing"]) : pick(["pending", "confirmed", "pending"]);
    orders.push(makeOrder(c, items, created, status, pick<PaymentMethod>(["cod", "cod", "bkash", "card", "emi", "nagad"])));
  }

  // The demo shopper's own history.
  const me = customers[0];
  orders.push(makeOrder(me, [line(byId("airpods-pro-2"))], now - 21 * day, "delivered", "bkash"));
  orders.push(makeOrder(me, [line(byId("anker-powercore-10000"), 2), line(byId("gan-charger-30w"))], now - 9 * day, "delivered", "cod"));
  orders.push(makeOrder(me, [line(byId("galaxy-watch-46mm"))], now - 2 * day, "shipped", "card"));
  orders.push(makeOrder(me, [line(byId("jbl-flip-5"))], now - 5 * 3600e3, "pending", "cod"));

  const iphone18 = byId("iphone-18-pro");
  const preItems = [line(iphone18, 1, "Burgundy · 256GB")];
  orders.push(
    makeOrder(me, preItems, now - 3 * day, "confirmed", "bkash", {
      type: "preorder",
      releaseDate: iphone18.preOrder!.releaseDate,
      paid: iphone18.preOrder!.deposit,
      deliveryFee: 0,
      total: iphone18.price,
    })
  );
  const s26 = byId("galaxy-s26-ultra");
  orders.push(
    makeOrder(customers[5], [line(s26, 1, "Cobalt Violet · 256GB")], now - 1 * day, "pending", "card", {
      type: "preorder",
      releaseDate: s26.preOrder!.releaseDate,
      paid: s26.preOrder!.deposit,
      deliveryFee: 0,
      total: s26.price,
    })
  );

  orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Counter sales (cash memos).
  let memoSeq = 1000;
  const memos: Memo[] = [];
  for (let i = 0; i < 42; i++) {
    const age = Math.floor(rand() * 30);
    const items = Array.from({ length: rand() < 0.75 ? 1 : 2 }, () => line(pick(inStock)));
    const subtotal = items.reduce((s, l) => s + l.price * l.qty, 0);
    const discount = rand() < 0.3 ? Math.round((subtotal * 0.02) / 100) * 100 : 0;
    const total = subtotal - discount;
    const due = rand() < 0.12 ? Math.round((total * 0.3) / 100) * 100 : 0;
    memos.push({
      id: `CM-${++memoSeq}`,
      createdAt: new Date(now - age * day - Math.floor(rand() * 9) * 3600e3).toISOString(),
      customerName: pick(customerSeed).name,
      customerPhone: pick(customerSeed).phone,
      items,
      subtotal,
      discount,
      total,
      paid: total - due,
      paymentMethod: pick<PaymentMethod>(["cash", "cash", "card", "bkash", "emi"]),
      soldBy: pick(["Tanvir Hasan", "Nusrat Jahan", "Arif Chowdhury"]),
    });
  }
  memos.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // Operating expenses for the month.
  const expenses: Expense[] = [];
  let ex = 0;
  const addExpense = (daysAgo: number, category: ExpenseCategory, amount: number, note: string) =>
    expenses.push({ id: `ex${++ex}`, date: new Date(now - daysAgo * day).toISOString(), category, amount, note });
  addExpense(27, "Rent", 120000, "Showroom & warehouse rent");
  addExpense(25, "Salary", 210000, "Staff salary");
  addExpense(20, "Utility", 18500, "Electricity bill");
  addExpense(18, "Utility", 6000, "Internet & phone");
  addExpense(14, "Marketing", 30000, "Facebook & Google ads");
  addExpense(8, "Transport", 12500, "Courier & delivery charges");
  addExpense(4, "Marketing", 8000, "In-store banner print");
  addExpense(2, "Other", 3500, "Office supplies");
  expenses.sort((a, b) => b.date.localeCompare(a.date));

  const t = (mins: number) => new Date(now - mins * 60e3).toISOString();
  const chats: ChatThread[] = [
    {
      id: "ch1",
      customerId: DEMO_USER_ID,
      customerName: me.name,
      messages: [
        { id: "m1", from: "customer", text: "Hi, is iPhone 18 Pro pre-order available in Burgundy?", at: t(3000) },
        { id: "m2", from: "admin", text: "Hello Rahim! Yes, Burgundy 256GB is open for pre-order with a ৳20,000 deposit.", at: t(2990) },
        { id: "m3", from: "customer", text: "Great, I just placed it. Thanks!", at: t(2970) },
      ],
      adminUnread: 0,
      customerUnread: 0,
      updatedAt: t(2970),
    },
    {
      id: "ch2",
      customerId: "cu3",
      customerName: "Mahmudul Hasan",
      messages: [
        { id: "m4", from: "customer", text: "Do you deliver the PS5 to Chattogram? How many days?", at: t(35) },
      ],
      adminUnread: 1,
      customerUnread: 0,
      updatedAt: t(35),
    },
    {
      id: "ch3",
      customerId: "cu6",
      customerName: "Nabila Chowdhury",
      messages: [
        { id: "m5", from: "customer", text: "Is 0% EMI available with City Bank card for the S26 Ultra?", at: t(12) },
        { id: "m6", from: "customer", text: "Also want to know the exchange value of my S23.", at: t(11) },
      ],
      adminUnread: 2,
      customerUnread: 0,
      updatedAt: t(11),
    },
  ];

  return {
    ...catalogState,
    seeded: true,
    customers,
    orders,
    memos,
    expenses,
    chats,
    wishlist: [byId("iphone-17-pro-max").id, byId("dji-mini-4-pro").id],
    seq: { order: orderSeq, memo: memoSeq, product: products.length },
  };
}
