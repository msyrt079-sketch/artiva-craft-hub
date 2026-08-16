import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Printer } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/stat-card";
import { money, num, orderProfit, orderRevenue, useRows, type Row } from "@/lib/db";
import {
  RANGE_LABELS,
  bestSellers,
  downloadCsv,
  inRange,
  rangeBounds,
  summarize,
  type RangeKey,
} from "@/lib/insights";

export const Route = createFileRoute("/_authenticated/reports")({
  head: () => ({
    meta: [
      { title: "Reports — Artiva Business" },
      { name: "description", content: "Automatic weekly, monthly and yearly business reports." },
      { property: "og:title", content: "Reports — Artiva Business" },
      { property: "og:description", content: "Export and print your business reports." },
    ],
  }),
  component: ReportsPage,
});

const RANGES: RangeKey[] = ["week", "month", "year", "all"];

function ReportsPage() {
  const { data: orders = [] } = useRows("orders");
  const { data: expenses = [] } = useRows("expenses");
  const [range, setRange] = useState<RangeKey>("month");

  const bounds = rangeBounds(range);
  const fOrders =
    range === "all" ? orders : orders.filter((o: Row) => inRange(o.order_date, bounds));
  const fExpenses =
    range === "all" ? expenses : expenses.filter((e: Row) => inRange(e.expense_date, bounds));
  const s = summarize(fOrders, fExpenses);
  const top = bestSellers(fOrders).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle={`Summary for ${RANGE_LABELS[range].toLowerCase()}.`}
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() =>
                downloadCsv(
                  `artiva-${range}.csv`,
                  fOrders.map((o: Row) => ({
                    order: o.order_number,
                    date: o.order_date,
                    customer: o.customer_name,
                    product: o.product_name,
                    category: o.category,
                    quantity: num(o.quantity),
                    revenue: orderRevenue(o),
                    profit: orderProfit(o),
                    status: o.status,
                  })),
                )
              }
            >
              <Download className="size-4" /> CSV
            </Button>
            <Button onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        {RANGES.map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              range === r ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revenue" value={money(s.revenue)} tone="good" />
        <StatCard label="Expenses" value={money(s.expenses)} />
        <StatCard label="Net profit" value={money(s.netProfit)} tone={s.netProfit >= 0 ? "good" : "bad"} />
        <StatCard label="Orders" value={String(s.orders)} />
      </div>

      <div className="card-soft space-y-2 p-4">
        <h2 className="font-display text-base font-semibold">Highlights</h2>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>Average order value: {money(s.avgOrder)}</li>
          <li>Profit margin: {s.margin.toFixed(1)}%</li>
          <li>Material spend: {money(s.materialCost)}</li>
          <li>Business expenses: {money(s.businessExpenses)}</li>
          {top[0] ? <li>Best seller: {top[0].name} ({top[0].qty} sold)</li> : null}
        </ul>
      </div>

      <div className="card-soft overflow-x-auto p-4">
        <h2 className="mb-3 font-display text-base font-semibold">Orders in period</h2>
        {fOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders in this period.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Order</th>
                <th>Date</th>
                <th>Product</th>
                <th className="text-right">Revenue</th>
                <th className="text-right">Profit</th>
              </tr>
            </thead>
            <tbody>
              {fOrders.map((o: Row) => (
                <tr key={o.id} className="border-t border-border/70">
                  <td className="py-2">{o.order_number}</td>
                  <td>{o.order_date}</td>
                  <td>{o.product_name}</td>
                  <td className="text-right">{money(orderRevenue(o))}</td>
                  <td className="text-right">{money(orderProfit(o))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
