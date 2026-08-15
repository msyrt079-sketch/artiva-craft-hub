import { num, orderProfit, orderRevenue, type Row } from "@/lib/db";

export type RangeKey = "today" | "week" | "month" | "year" | "all" | "custom";

export const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  week: "This week",
  month: "This month",
  year: "This year",
  all: "All time",
  custom: "Custom",
};

export function rangeBounds(key: RangeKey, from?: string, to?: string): [Date, Date] {
  const now = new Date();
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  switch (key) {
    case "today":
      return [new Date(now.getFullYear(), now.getMonth(), now.getDate()), end];
    case "week": {
      const day = (now.getDay() + 6) % 7;
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
      return [start, end];
    }
    case "month":
      return [new Date(now.getFullYear(), now.getMonth(), 1), end];
    case "year":
      return [new Date(now.getFullYear(), 0, 1), end];
    case "custom":
      return [
        from ? new Date(from) : new Date(2000, 0, 1),
        to ? new Date(`${to}T23:59:59`) : end,
      ];
    default:
      return [new Date(2000, 0, 1), end];
  }
}

export function inRange(dateStr: string | null | undefined, bounds: [Date, Date]) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= bounds[0] && d <= bounds[1];
}

export function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function summarize(orders: Row[], expenses: Row[]) {
  const active = orders.filter((o: Row) => o.status !== "Cancelled");
  const revenue = active.reduce((s: number, o: Row) => s + orderRevenue(o), 0);
  const materialCost = active.reduce((s: number, o: Row) => s + num(o.material_cost), 0);
  const otherCosts = active.reduce((s: number, o: Row) => s + num(o.other_costs), 0);
  const businessExpenses = expenses.reduce((s: number, e: Row) => s + num(e.amount), 0);
  const grossProfit = active.reduce((s: number, o: Row) => s + orderProfit(o), 0);
  return {
    revenue,
    materialCost,
    otherCosts,
    businessExpenses,
    expenses: materialCost + otherCosts + businessExpenses,
    grossProfit,
    netProfit: grossProfit - businessExpenses,
    orders: active.length,
    margin: revenue > 0 ? ((grossProfit - businessExpenses) / revenue) * 100 : 0,
    avgOrder: active.length ? revenue / active.length : 0,
  };
}

export function bestSellers(orders: Row[]) {
  const map = new Map<string, { name: string; qty: number; revenue: number; profit: number }>();
  for (const o of orders) {
    if (o.status === "Cancelled") continue;
    const name = o.product_name || "Unnamed";
    const cur = map.get(name) ?? { name, qty: 0, revenue: 0, profit: 0 };
    cur.qty += num(o.quantity);
    cur.revenue += orderRevenue(o);
    cur.profit += orderProfit(o);
    map.set(name, cur);
  }
  return [...map.values()].sort((a, b) => b.qty - a.qty);
}

export function monthlySeries(orders: Row[], expenses: Row[], months = 6) {
  const out: { month: string; revenue: number; expenses: number; profit: number; orders: number }[] =
    [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    const mo = orders.filter(
      (o: Row) => o.status !== "Cancelled" && o.order_date && monthKey(new Date(o.order_date)) === key,
    );
    const me = expenses.filter(
      (e: Row) => e.expense_date && monthKey(new Date(e.expense_date)) === key,
    );
    const s = summarize(mo, me);
    out.push({
      month: d.toLocaleDateString(undefined, { month: "short" }),
      revenue: Math.round(s.revenue),
      expenses: Math.round(s.expenses),
      profit: Math.round(s.netProfit),
      orders: mo.length,
    });
  }
  return out;
}

export function lowStockMaterials(materials: Row[]) {
  return materials.filter((m: Row) => num(m.quantity) <= num(m.min_stock));
}

export function buildNotifications(
  orders: Row[],
  materials: Row[],
  products: Row[],
  expenses: Row[],
) {
  const notes: { icon: string; text: string; tone: "warn" | "good" | "info" }[] = [];

  for (const m of lowStockMaterials(materials)) {
    notes.push({
      icon: "⚠️",
      text: `Low stock: ${m.name} (${num(m.quantity)} ${m.unit ?? ""} left)`,
      tone: "warn",
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  for (const o of orders) {
    if (o.delivery_date === tomorrow && o.status !== "Delivered") {
      notes.push({ icon: "📦", text: `Order ${o.order_number} is due tomorrow.`, tone: "info" });
    }
    if (o.delivery_date && o.delivery_date < today && !["Delivered", "Cancelled"].includes(o.status)) {
      notes.push({ icon: "⏰", text: `Order ${o.order_number} is past its delivery date.`, tone: "warn" });
    }
  }

  const todayProfit = orders
    .filter((o: Row) => o.order_date === today && o.status !== "Cancelled")
    .reduce((s: number, o: Row) => s + orderProfit(o), 0);
  if (todayProfit > 0) {
    notes.push({ icon: "💰", text: `You made ${todayProfit.toFixed(2)} TND profit today.`, tone: "good" });
  }

  for (const p of products) {
    const price = num(p.selling_price);
    if (price > 0) {
      const margin = ((price - num(p.production_cost)) / price) * 100;
      if (margin < 20) {
        notes.push({
          icon: "📉",
          text: `"${p.name}" has a very low profit margin (${margin.toFixed(0)}%).`,
          tone: "warn",
        });
      }
    }
  }

  const best = bestSellers(orders)[0];
  if (best && best.qty > 0) {
    notes.push({ icon: "🔥", text: `"${best.name}" is your best-selling product.`, tone: "good" });
  }

  const monthExpenses = expenses.filter((e: Row) =>
    e.expense_date ? new Date(e.expense_date).getMonth() === new Date().getMonth() : false,
  );
  if (monthExpenses.length > 0) {
    const total = monthExpenses.reduce((s: number, e: Row) => s + num(e.amount), 0);
    notes.push({ icon: "🧾", text: `${total.toFixed(2)} TND spent on expenses this month.`, tone: "info" });
  }

  return notes;
}

export function toCsv(rows: Record<string, string | number>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]!);
  const escape = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
  ].join("\n");
}

export function downloadCsv(filename: string, rows: Record<string, string | number>[]) {
  const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
