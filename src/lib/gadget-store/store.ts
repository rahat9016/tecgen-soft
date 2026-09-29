"use client";

import { useSyncExternalStore } from "react";
import { catalogState, createSeed, DB_VERSION } from "./seed";
import type {
  CartLine,
  ChatThread,
  Customer,
  Expense,
  GadgetDB,
  Memo,
  Order,
  OrderLine,
  OrderStatus,
  PaymentMethod,
  Product,
} from "./types";

/**
 * Demo backend for the gadgets store: one JSON document in localStorage, shared by the
 * storefront and the admin panel. Other tabs pick up changes through the `storage` event,
 * which is what makes customer ⇄ admin chat feel live.
 */
const KEY = "gadgethub:db";

let state: GadgetDB | null = null;
const listeners = new Set<() => void>();

function load(): GadgetDB {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as GadgetDB;
      if (parsed.version === DB_VERSION && parsed.seeded) return parsed;
    }
  } catch {
    // fall through to a fresh seed
  }
  const fresh = createSeed();
  persist(fresh);
  return fresh;
}

function persist(next: GadgetDB) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Quota exceeded (large uploaded images) — keep working in memory.
  }
}

function getState(): GadgetDB {
  if (typeof window === "undefined") return catalogState;
  if (!state) state = load();
  return state;
}

function emit() {
  listeners.forEach((l) => l());
}

// One window-level listener for the whole app (not one per subscriber), so a write in another
// tab is parsed once and fans out to subscribers once.
function onStorage(e: StorageEvent) {
  if (e.key !== KEY) return;
  try {
    state = e.newValue ? (JSON.parse(e.newValue) as GadgetDB) : load();
  } catch {
    return;
  }
  emit();
}

function subscribe(listener: () => void) {
  if (listeners.size === 0) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener("storage", onStorage);
  };
}

function update(fn: (s: GadgetDB) => GadgetDB) {
  state = fn(getState());
  persist(state);
  emit();
}

/** Whole DB. Derive slices with useMemo in components. Server/first paint sees catalog only. */
export function useGadgetDB(): GadgetDB {
  return useSyncExternalStore(subscribe, getState, () => catalogState);
}

const noop = () => () => {};
/** True once the client store (orders, memos, chats …) is available. */
export function useHydrated() {
  return useSyncExternalStore(noop, () => true, () => false);
}

const uid = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
const nowIso = () => new Date().toISOString();

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/* ───────────── selectors ───────────── */

export const orderDue = (o: Pick<Order, "total" | "paid">) => Math.max(0, o.total - o.paid);
export const lineProfit = (l: OrderLine) => (l.price - l.cost) * l.qty;

export function currentUser(db: GadgetDB): Customer {
  return (
    db.customers.find((c) => c.id === db.currentUserId) ?? {
      id: db.currentUserId,
      name: "Guest",
      phone: "",
      email: "",
      address: "",
      city: "Dhaka",
      joinedAt: nowIso(),
    }
  );
}

export function cartDetails(db: GadgetDB) {
  const lines = db.cart
    .map((l) => ({ ...l, product: db.products.find((p) => p.id === l.productId) }))
    .filter((l): l is CartLine & { product: Product } => !!l.product);
  const subtotal = lines.reduce((s, l) => s + l.product.price * l.qty, 0);
  return { lines, subtotal, count: lines.reduce((s, l) => s + l.qty, 0) };
}

export const deliveryFeeFor = (subtotal: number, city: string) =>
  subtotal >= 20000 ? 0 : city.trim().toLowerCase() === "dhaka" ? 80 : 150;

/* ───────────── cart & wishlist ───────────── */

export function addToCart(productId: string, qty = 1, variant?: string) {
  const key = `${productId}|${variant ?? ""}`;
  update((s) => {
    const existing = s.cart.find((l) => l.key === key);
    const cart = existing
      ? s.cart.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l))
      : [...s.cart, { key, productId, qty, variant }];
    return { ...s, cart };
  });
}

export function setCartQty(key: string, qty: number) {
  update((s) => ({
    ...s,
    cart: qty <= 0 ? s.cart.filter((l) => l.key !== key) : s.cart.map((l) => (l.key === key ? { ...l, qty } : l)),
  }));
}

export function toggleWishlist(productId: string) {
  update((s) => ({
    ...s,
    wishlist: s.wishlist.includes(productId)
      ? s.wishlist.filter((id) => id !== productId)
      : [...s.wishlist, productId],
  }));
}

/* ───────────── orders ───────────── */

export type CheckoutInput = {
  customer: Order["customer"];
  lines: { product: Product; qty: number; variant?: string }[];
  paymentMethod: PaymentMethod;
  note?: string;
  clearCart: boolean;
};

export function placeOrder(input: CheckoutInput): string {
  let id = "";
  update((s) => {
    const items: OrderLine[] = input.lines.map(({ product, qty, variant }) => ({
      productId: product.id,
      name: product.name,
      image: product.image,
      price: product.price,
      cost: product.cost,
      qty,
      variant,
    }));
    const subtotal = items.reduce((sum, l) => sum + l.price * l.qty, 0);
    const pre = input.lines.find((l) => l.product.preOrder)?.product.preOrder ?? null;
    const deliveryFee = pre ? 0 : deliveryFeeFor(subtotal, input.customer.city);
    const total = subtotal + deliveryFee;
    const paid = pre
      ? pre.deposit * input.lines.reduce((q, l) => q + l.qty, 0)
      : input.paymentMethod === "cod"
        ? 0
        : total;

    const seq = s.seq.order + 1;
    id = `GH-${seq}`;
    const at = nowIso();
    const order: Order = {
      id,
      createdAt: at,
      customerId: s.currentUserId,
      customer: input.customer,
      items,
      subtotal,
      deliveryFee,
      discount: 0,
      total,
      paid,
      paymentMethod: input.paymentMethod,
      type: pre ? "preorder" : "regular",
      releaseDate: pre?.releaseDate,
      status: "pending",
      timeline: [{ status: "pending", at, note: pre ? "Pre-order reserved, deposit received" : "Order placed" }],
      note: input.note,
    };

    const products = pre
      ? s.products
      : s.products.map((p) => {
          const bought = items.filter((l) => l.productId === p.id).reduce((q, l) => q + l.qty, 0);
          return bought ? { ...p, stock: Math.max(0, p.stock - bought) } : p;
        });

    // Keep the shopper's profile in sync with what they typed at checkout.
    const customers = s.customers.map((c) => (c.id === s.currentUserId ? { ...c, ...input.customer } : c));

    return {
      ...s,
      products,
      customers,
      orders: [order, ...s.orders],
      cart: input.clearCart ? [] : s.cart,
      seq: { ...s.seq, order: seq },
    };
  });
  return id;
}

export function setOrderStatus(id: string, status: OrderStatus, note?: string) {
  update((s) => ({
    ...s,
    orders: s.orders.map((o) => {
      if (o.id !== id || o.status === status) return o;
      // COD is collected on delivery.
      const paid = status === "delivered" ? o.total : status === "cancelled" ? 0 : o.paid;
      return { ...o, status, paid, timeline: [...o.timeline, { status, at: nowIso(), note }] };
    }),
  }));
}

export function recordOrderPayment(id: string, amount: number) {
  update((s) => ({
    ...s,
    orders: s.orders.map((o) => (o.id === id ? { ...o, paid: Math.min(o.total, o.paid + amount) } : o)),
  }));
}

export function cancelOwnOrder(id: string) {
  setOrderStatus(id, "cancelled", "Cancelled by customer");
}

/* ───────────── catalog admin ───────────── */

export type ProductInput = Omit<Product, "id" | "slug"> & { slug?: string };

export function saveProduct(input: ProductInput, id?: string): string {
  let savedId = id ?? "";
  update((s) => {
    if (id) {
      return { ...s, products: s.products.map((p) => (p.id === id ? { ...p, ...input, slug: input.slug || p.slug } : p)) };
    }
    const seq = s.seq.product + 1;
    savedId = `g${seq}`;
    let slug = input.slug || slugify(input.name);
    if (s.products.some((p) => p.slug === slug)) slug = `${slug}-${seq}`;
    return { ...s, products: [{ ...input, id: savedId, slug }, ...s.products], seq: { ...s.seq, product: seq } };
  });
  return savedId;
}

export function deleteProduct(id: string) {
  update((s) => ({ ...s, products: s.products.filter((p) => p.id !== id) }));
}

export function saveNamed(kind: "categories" | "brands", name: string, id?: string) {
  update((s) => {
    const list = s[kind];
    const old = id ? list.find((x) => x.id === id) : undefined;
    const next = old
      ? list.map((x) => (x.id === id ? { ...x, name } : x))
      : [...list, { id: uid(kind[0]), name }];
    // Renaming cascades to products so filters keep working.
    const field = kind === "categories" ? "category" : "brand";
    const products = old ? s.products.map((p) => (p[field] === old.name ? { ...p, [field]: name } : p)) : s.products;
    return { ...s, [kind]: next, products };
  });
}

export function deleteNamed(kind: "categories" | "brands", id: string) {
  update((s) => ({ ...s, [kind]: s[kind].filter((x) => x.id !== id) }));
}

/* ───────────── cash memo & accounts ───────────── */

export function createMemo(input: Omit<Memo, "id" | "createdAt">): string {
  let id = "";
  update((s) => {
    const seq = s.seq.memo + 1;
    id = `CM-${seq}`;
    const products = s.products.map((p) => {
      const sold = input.items.filter((l) => l.productId === p.id).reduce((q, l) => q + l.qty, 0);
      return sold ? { ...p, stock: Math.max(0, p.stock - sold) } : p;
    });
    return {
      ...s,
      products,
      memos: [{ ...input, id, createdAt: nowIso() }, ...s.memos],
      seq: { ...s.seq, memo: seq },
    };
  });
  return id;
}

export function recordMemoPayment(id: string, amount: number) {
  update((s) => ({
    ...s,
    memos: s.memos.map((m) => (m.id === id ? { ...m, paid: Math.min(m.total, m.paid + amount) } : m)),
  }));
}

export function addExpense(input: Omit<Expense, "id">) {
  update((s) => ({ ...s, expenses: [{ ...input, id: uid("ex") }, ...s.expenses] }));
}

export function deleteExpense(id: string) {
  update((s) => ({ ...s, expenses: s.expenses.filter((e) => e.id !== id) }));
}

/* ───────────── profile ───────────── */

export function updateProfile(patch: Partial<Omit<Customer, "id" | "joinedAt">>) {
  update((s) => ({
    ...s,
    customers: s.customers.map((c) => (c.id === s.currentUserId ? { ...c, ...patch } : c)),
    chats: s.chats.map((t) => (t.customerId === s.currentUserId && patch.name ? { ...t, customerName: patch.name } : t)),
  }));
}

/* ───────────── chat ───────────── */

export function sendChat(customerId: string, from: "customer" | "admin", text: string) {
  const msg = { id: uid("m"), from, text, at: nowIso() };
  update((s) => {
    const existing = s.chats.find((t) => t.customerId === customerId);
    const customer = s.customers.find((c) => c.id === customerId);
    const thread: ChatThread = existing
      ? {
          ...existing,
          messages: [...existing.messages, msg],
          adminUnread: existing.adminUnread + (from === "customer" ? 1 : 0),
          customerUnread: existing.customerUnread + (from === "admin" ? 1 : 0),
          updatedAt: msg.at,
        }
      : {
          id: uid("ch"),
          customerId,
          customerName: customer?.name ?? "Customer",
          messages: [msg],
          adminUnread: from === "customer" ? 1 : 0,
          customerUnread: from === "admin" ? 1 : 0,
          updatedAt: msg.at,
        };
    return { ...s, chats: [thread, ...s.chats.filter((t) => t.id !== thread.id)] };
  });
}

export function markChatRead(customerId: string, side: "customer" | "admin") {
  const field = side === "admin" ? "adminUnread" : "customerUnread";
  const thread = getState().chats.find((t) => t.customerId === customerId);
  if (!thread || thread[field] === 0) return;
  update((s) => ({
    ...s,
    chats: s.chats.map((t) => (t.customerId === customerId ? { ...t, [field]: 0 } : t)),
  }));
}

export function resetDemoData() {
  state = createSeed();
  persist(state);
  emit();
}
