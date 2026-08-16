import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Boxes,
  Hammer,
  CalendarDays,
  CalendarRange,
  Plus,
} from "lucide-react";
import { StatCard } from "@/components/stat-card";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecordDialog } from "@/components/record-dialog";
import {
  money,
  num,
  useRows,
  useSaveRow,
  orderRevenue,
  orderProfit,
  type Row,
  type TableName,
} from "@/lib/db";
import {
  RANGE_LABELS,
  bestSellers,
  inRange,
  monthlySeries,
  rangeBounds,
  summarize,
  type RangeKey,
} from "@/lib/insights";
import { quickActions } from "@/lib/fields";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Artiva Business" },
      {
        name: "description",
        content: "Revenue, expenses, profit and orders for your handmade business at a glance.",
      },
      { property: "og:title", content: "Dashboard — Artiva Business" },
      { property: "og:description", content: "Your handmade business numbers at a glance." },
    ],
  }),
  component: Dashboard,
});

const RANGES: RangeKey[] = ["today", "week", "month", "year", "all", "custom"];

function Dashboard() {
  const { data: orders = [] } = useRows("orders");
  const { data: expenses = [] } = useRows("expenses");
  const { data: materials = [] } = useRows("materials");
  const { data: products = [] } = useRows("products");
  const { data: customers = [] } = useRows("customers");

  const [range, setRange] = useState<RangeKey>("month");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [action, setAction] = useState<number | null>(null);

  const bounds = useMemo(() => rangeBounds(range, from, to), [range, from, to]);
  const fOrders = orders.filter((o: Row) => (range === "all" ? true : inRange(o.order_date, bounds)));
  const fExpenses = expenses.filter((e: Row) =>
    range === "all" ? true : inRange(e.expense_date, bounds),
  );

  const s = summarize(fOrders, fExpenses);
  const monthStats = summarize(
    orders.filter((o: Row) => inRange(o.order_date, rangeBounds("month"))),
    expenses.filter((e: Row) => inRange(e.expense_date, rangeBounds("month"))),
  );
  const yearStats = summarize(
    orders.filter((o: Row) => inRange(o.order_date, rangeBounds("year"))),
    expenses.filter((e: Row) => inRange(e.expense_date, rangeBounds("year"))),
  );

  const pending = fOrders.filter((o: Row) => ["New", "In production", "Ready"].includes(o.status));
  const completed = fOrders.filter((o: Row) => o.status === "Delivered");
  const stockCount = products.reduce((t: number, p: Row) => t + num(p.stock_quantity), 0);

  const series = monthlySeries(orders, expenses);
  const top = bestSellers(fOrders).slice(0, 5);
  const chartColors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
  ];

  const daily = useMemo(() => {
    const map = new Map<string, { day: string; revenue: number; profit: number }>();
    for (const o of fOrders) {
      if (!o.order_date || o.status === "Cancelled") continue;
      const cur = map.get(o.order_date) ?? { day: o.order_date.slice(5), revenue: 0, profit: 0 };
      cur.revenue += orderRevenue(o);
      cur.profit += orderProfit(o);
      map.set(o.order_date, cur);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([, v]) => v);
  }, [fOrders]);

  const actions = quickActions({ products, customers, materials });
  const current = action === null ? null : actions[action]!;
  const save = useSaveRow((current?.table ?? "orders") as TableName);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" subtitle="Everything about Artiva, at a glance." />

      <div className="flex flex-wrap gap-2">
        {actions.map((a, i) => (
          <Button key={a.label} variant="secondary" size="sm" onClick={() => setAction(i)}>
            <Plus className="size-4" /> {a.label}
          </Button>
        ))}
      </div>

      <div className="card-soft flex flex-wrap items-center gap-2 p-3">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              range === r
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
        {range === "custom" ? (
          <div className="flex flex-1 gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revenue" value={money(s.revenue)} icon={Wallet} tone="good" />
        <StatCard label="Expenses" value={money(s.expenses)} icon={TrendingDown} />
        <StatCard
          label="Net profit"
          value={money(s.netProfit)}
          icon={TrendingUp}
          tone={s.netProfit >= 0 ? "good" : "bad"}
          hint={`${s.margin.toFixed(1)}% margin`}
        />
        <StatCard label="Orders" value={String(s.orders)} icon={ShoppingBag} />
        <StatCard label="Pending orders" value={String(pending.length)} icon={Clock} tone="warn" />
        <StatCard label="Completed orders" value={String(completed.length)} icon={CheckCircle2} />
        <StatCard label="Products in stock" value={String(stockCount)} icon={Boxes} />
        <StatCard label="Material cost" value={money(s.materialCost)} icon={Hammer} />
        <StatCard
          label="Profit this month"
          value={money(monthStats.netProfit)}
          icon={CalendarDays}
          tone={monthStats.netProfit >= 0 ? "good" : "bad"}
        />
        <StatCard
          label="Profit this year"
          value={money(yearStats.netProfit)}
          icon={CalendarRange}
          tone={yearStats.netProfit >= 0 ? "good" : "bad"}
        />
        <StatCard label="Average order" value={money(s.avgOrder)} />
        <StatCard label="Customers" value={String(customers.length)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Revenue & expenses" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart data={series}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                  <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="var(--chart-1)"
                fill="url(#rev)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                stroke="var(--chart-5)"
                fill="transparent"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Profit trend" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
              <Tooltip />
              <Line type="monotone" dataKey="profit" stroke="var(--chart-4)" strokeWidth={3} dot />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Orders per month" subtitle="Volume">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} fontSize={12} width={30} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="orders" radius={[8, 8, 0, 0]} fill="var(--chart-2)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Best-selling products" subtitle="In selected period">
          {top.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">No sales yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={230}>
              <BarChart data={top} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tickLine={false} axisLine={false} fontSize={12} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={90} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="qty" radius={[0, 8, 8, 0]}>
                  {top.map((_, i) => (
                    <Cell key={i} fill={chartColors[i % chartColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {daily.length > 1 ? (
          <ChartCard title="Daily revenue & profit" subtitle={RANGE_LABELS[range]}>
            <ResponsiveContainer width="100%" height={230}>
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} fontSize={12} width={40} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="var(--chart-1)" strokeWidth={2} />
                <Line type="monotone" dataKey="profit" stroke="var(--chart-4)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        ) : null}
      </div>

      {current ? (
        <RecordDialog
          open={action !== null}
          onOpenChange={(v) => setAction(v ? action : null)}
          title={current.label}
          fields={current.fields}
          saving={save.isPending}
          onSubmit={async (values) => {
            await save.mutateAsync(current.transform ? current.transform(values) : values);
            setAction(null);
          }}
        />
      ) : null}
    </div>
  );
}

export function ChartCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-soft p-4">
      <div className="mb-3">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
      </div>
      {children}
    </div>
  );
}
