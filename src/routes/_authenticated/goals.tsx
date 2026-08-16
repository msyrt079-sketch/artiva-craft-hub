import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";
import { money, num, useRows, type Row } from "@/lib/db";
import { goalFields } from "@/lib/fields";
import { inRange, rangeBounds, summarize } from "@/lib/insights";

export const Route = createFileRoute("/_authenticated/goals")({
  head: () => ({
    meta: [
      { title: "Goals — Artiva Business" },
      { name: "description", content: "Set revenue, profit and order goals and watch your progress." },
      { property: "og:title", content: "Goals — Artiva Business" },
      { property: "og:description", content: "Track your monthly and yearly business goals." },
    ],
  }),
  component: GoalsPage,
});

function GoalsPage() {
  const { data: orders = [] } = useRows("orders");
  const { data: expenses = [] } = useRows("expenses");
  const { data: products = [] } = useRows("products");

  function progressFor(g: Row) {
    const bounds = rangeBounds(g.period === "year" ? "year" : "month");
    const s = summarize(
      orders.filter((o: Row) => inRange(o.order_date, bounds)),
      expenses.filter((e: Row) => inRange(e.expense_date, bounds)),
    );
    switch (g.kind) {
      case "profit":
        return { current: s.netProfit, isMoney: true };
      case "orders":
        return { current: s.orders, isMoney: false };
      case "products":
        return { current: products.length, isMoney: false };
      default:
        return { current: s.revenue, isMoney: true };
    }
  }

  return (
    <CrudPage
      table="goals"
      title="Goals"
      subtitle="Small targets, steady growth."
      addLabel="New goal"
      fields={goalFields}
      searchKeys={["kind", "period"]}
      emptyText="No goals yet."
      renderItem={(g: Row) => {
        const { current, isMoney } = progressFor(g);
        const pct = num(g.target) > 0 ? Math.min(100, (current / num(g.target)) * 100) : 0;
        const fmt = (v: number) => (isMoney ? money(v) : String(Math.round(v)));
        return (
          <div className="space-y-2">
            <p className="font-display text-base font-semibold capitalize">
              {g.kind} · {g.period === "year" ? "this year" : "this month"}
            </p>
            <div className="h-2.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {fmt(current)} of {fmt(num(g.target))} · {pct.toFixed(0)}%
            </p>
          </div>
        );
      }}
    />
  );
}
