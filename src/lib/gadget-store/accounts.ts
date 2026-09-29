import type { GadgetDB, OrderLine, PaymentMethod } from "./types";

const inRange = (iso: string, from: number, to: number) => {
  const t = new Date(iso).getTime();
  return t >= from && t <= to;
};

const cogs = (items: OrderLine[]) => items.reduce((s, l) => s + l.cost * l.qty, 0);

export type Ledger = ReturnType<typeof computeLedger>;

/**
 * Accounting summary for a date range.
 * - Regular web orders and counter memos count as sales when created (cancelled excluded).
 * - Pre-order deposits are advances (a liability) until the order is delivered.
 * - Cash collected is what was actually received; receivables are the unpaid balance.
 */
export function computeLedger(db: GadgetDB, from: number, to: number = Date.now()) {
  const orders = db.orders.filter((o) => o.status !== "cancelled" && inRange(o.createdAt, from, to));
  const saleOrders = orders.filter((o) => o.type === "regular" || o.status === "delivered");
  const preOrders = orders.filter((o) => o.type === "preorder" && o.status !== "delivered");
  const memos = db.memos.filter((m) => inRange(m.createdAt, from, to));
  const expenses = db.expenses.filter((e) => inRange(e.date, from, to));

  const onlineSales = saleOrders.reduce((s, o) => s + o.total, 0);
  const counterSales = memos.reduce((s, m) => s + m.total, 0);
  const sales = onlineSales + counterSales;
  const deliveryIncome = saleOrders.reduce((s, o) => s + o.deliveryFee, 0);
  const costOfGoods = saleOrders.reduce((s, o) => s + cogs(o.items), 0) + memos.reduce((s, m) => s + cogs(m.items), 0);
  const discounts = memos.reduce((s, m) => s + m.discount, 0) + saleOrders.reduce((s, o) => s + o.discount, 0);
  const grossProfit = sales - costOfGoods;
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  const collected = saleOrders.reduce((s, o) => s + o.paid, 0) + memos.reduce((s, m) => s + m.paid, 0);
  const advances = preOrders.reduce((s, o) => s + o.paid, 0);
  const receivable =
    saleOrders.reduce((s, o) => s + Math.max(0, o.total - o.paid), 0) + memos.reduce((s, m) => s + Math.max(0, m.total - m.paid), 0);

  const byMethod = new Map<PaymentMethod, number>();
  const addMethod = (m: PaymentMethod, amt: number) => amt && byMethod.set(m, (byMethod.get(m) ?? 0) + amt);
  saleOrders.forEach((o) => addMethod(o.paymentMethod, o.paid));
  preOrders.forEach((o) => addMethod(o.paymentMethod, o.paid));
  memos.forEach((m) => addMethod(m.paymentMethod, m.paid));

  const expenseByCategory = new Map<string, number>();
  expenses.forEach((e) => expenseByCategory.set(e.category, (expenseByCategory.get(e.category) ?? 0) + e.amount));

  const categorySales = new Map<string, number>();
  const productOf = (id: string) => db.products.find((p) => p.id === id);
  [...saleOrders.flatMap((o) => o.items), ...memos.flatMap((m) => m.items)].forEach((l) => {
    const cat = productOf(l.productId)?.category ?? "Other";
    categorySales.set(cat, (categorySales.get(cat) ?? 0) + l.price * l.qty);
  });

  return {
    orders,
    saleOrders,
    preOrders,
    memos,
    expenses,
    onlineSales,
    counterSales,
    sales,
    deliveryIncome,
    costOfGoods,
    discounts,
    grossProfit,
    grossMargin: sales ? grossProfit / sales : 0,
    totalExpenses,
    netProfit,
    collected,
    advances,
    receivable,
    byMethod: [...byMethod.entries()].sort((a, b) => b[1] - a[1]),
    expenseByCategory: [...expenseByCategory.entries()].sort((a, b) => b[1] - a[1]),
    categorySales: [...categorySales.entries()].sort((a, b) => b[1] - a[1]),
  };
}

/** Sales per calendar day for the last `days` days (online + counter). */
export function dailySales(db: GadgetDB, days: number) {
  const out: { key: string; label: string; online: number; counter: number; total: number }[] = [];
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push({
      key: d.toDateString(),
      label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      online: 0,
      counter: 0,
      total: 0,
    });
  }
  const idx = new Map(out.map((d, i) => [d.key, i]));
  db.orders
    .filter((o) => o.status !== "cancelled" && (o.type === "regular" || o.status === "delivered"))
    .forEach((o) => {
      const i = idx.get(new Date(o.createdAt).toDateString());
      if (i !== undefined) out[i].online += o.total;
    });
  db.memos.forEach((m) => {
    const i = idx.get(new Date(m.createdAt).toDateString());
    if (i !== undefined) out[i].counter += m.total;
  });
  out.forEach((d) => (d.total = d.online + d.counter));
  return out;
}
