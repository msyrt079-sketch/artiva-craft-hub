import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { money, num, orderRevenue, useRows, type Row } from "@/lib/db";
import { bestSellers, monthlySeries, summarize } from "@/lib/insights";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Artiva Business" },
      { name: "description", content: "Category performance, best sellers and monthly comparisons." },
      { property: "og:title", content: "Analytics — Artiva Business" },
      { property: "og:description", content: "Understand what sells and what earns." },
    ],
  }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: orders = [] } = useRows("orders");
  const { data: expenses = [] } = useRows("expenses");
  const s = summarize(orders, expenses);
  const series = monthlySeries(orders, expenses, 12);
  const top = bestSellers(orders).slice(0, 6);

  const categories = ["Crochet", "Ceramics", "Painting"].map((c, i) => ({
    name: c,
    value: orders
      .filter((o: Row) => o.category === c && o.status !== "Cancelled")
      .reduce((t: number, o: Row) => t + orderRevenue(o), 0),
    color: `var(--chart-${i + 1})`,
  }));

  const byCategoryQty = ["Crochet", "Ceramics", "Painting"].map((c) => ({
    name: c,
    qty: orders
      .filter((o: Row) => o.category === c && o.status !== "Cancelled")
      .reduce((t: number, o: Row) => t + num(o.quantity), 0),
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="All time performance of Artiva." />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total revenue" value={money(s.revenue)} tone="good" />
        <StatCard label="Total profit" value={money(s.netProfit)} tone={s.netProfit >= 0 ? "good" : "bad"} />
        <StatCard label="Average order" value={money(s.avgOrder)} />
        <StatCard label="Profit margin" value={`${s.margin.toFixed(1)}%`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-soft p-4">
          <h2 className="mb-3 font-display text-base font-semibold">Revenue by category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={categories} dataKey="value" nameKey="name" outerRadius={85}>
                {categories.map((c) => (
                  <Cell key={c.name} fill={c.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card-soft p-4">
          <h2 className="mb-3 font-display text-base font-semibold">Units sold by category</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={byCategoryQty}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="qty" radius={[8, 8, 0, 0]} fill="var(--chart-2)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-soft p-4 lg:col-span-2">
          <h2 className="mb-3 font-display text-base font-semibold">Monthly comparison</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={45} />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]} fill="var(--chart-1)" />
              <Bar dataKey="expenses" radius={[8, 8, 0, 0]} fill="var(--chart-5)" />
              <Bar dataKey="profit" radius={[8, 8, 0, 0]} fill="var(--chart-4)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-soft p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Best sellers</h2>
        {top.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sales recorded yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {top.map((t) => (
              <li key={t.name} className="flex justify-between rounded-xl bg-secondary/60 px-3 py-2">
                <span>
                  {t.name} · {t.qty} sold
                </span>
                <span className="font-medium">
                  {money(t.revenue)} · profit {money(t.profit)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
