import { createFileRoute } from "@tanstack/react-router";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CrudPage } from "@/components/crud-page";
import { StatCard } from "@/components/stat-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { money, num, useRows, useSaveSettings, useSettings, type Row } from "@/lib/db";
import { expenseFields } from "@/lib/fields";
import { inRange, rangeBounds, summarize } from "@/lib/insights";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/money")({
  head: () => ({
    meta: [
      { title: "Money — Artiva Business" },
      { name: "description", content: "Expenses, net profit and how you split your earnings." },
      { property: "og:title", content: "Money — Artiva Business" },
      { property: "og:description", content: "Expenses, profit and profit distribution." },
    ],
  }),
  component: MoneyPage,
});

function Distribution({ profit }: { profit: number }) {
  const { data: settings } = useSettings();
  const saveSettings = useSaveSettings();
  const [draft, setDraft] = useState<Row | null>(null);
  const s = draft ?? settings;
  if (!s) return null;

  const parts = [
    { key: "dist_reinvest", label: "Reinvest", color: "var(--chart-1)" },
    { key: "dist_personal", label: "Personal", color: "var(--chart-2)" },
    { key: "dist_savings", label: "Savings", color: "var(--chart-3)" },
    { key: "dist_emergency", label: "Emergency", color: "var(--chart-4)" },
  ];
  const total = parts.reduce((t, p) => t + num(s[p.key]), 0);
  const data = parts.map((p) => ({
    name: p.label,
    value: Math.max(0, (profit * num(s[p.key])) / 100),
    color: p.color,
  }));

  return (
    <div className="card-soft space-y-4 p-4">
      <div>
        <h2 className="font-display text-base font-semibold">Profit distribution</h2>
        <p className="text-xs text-muted-foreground">
          Split {money(profit)} of net profit. Percentages total {total}%.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2">
          {parts.map((p) => (
            <div key={p.key} className="flex items-center gap-2">
              <span className="w-24 text-sm">{p.label}</span>
              <Input
                type="number"
                className="h-9 w-20"
                value={String(num(s[p.key]))}
                onChange={(e) => setDraft({ ...s, [p.key]: num(e.target.value) })}
              />
              <span className="text-sm text-muted-foreground">
                % → {money((profit * num(s[p.key])) / 100)}
              </span>
            </div>
          ))}
          <Button
            className="w-full"
            disabled={saveSettings.isPending}
            onClick={() =>
              saveSettings.mutate({
                dist_reinvest: num(s.dist_reinvest),
                dist_personal: num(s.dist_personal),
                dist_savings: num(s.dist_savings),
                dist_emergency: num(s.dist_emergency),
              })
            }
          >
            Save split
          </Button>
        </div>
      </div>
    </div>
  );
}

function MoneyPage() {
  const { data: orders = [] } = useRows("orders");
  const { data: expenses = [] } = useRows("expenses");
  const bounds = rangeBounds("month");
  const s = summarize(
    orders.filter((o: Row) => inRange(o.order_date, bounds)),
    expenses.filter((e: Row) => inRange(e.expense_date, bounds)),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Revenue (month)" value={money(s.revenue)} tone="good" />
        <StatCard label="Material budget" value={money(s.materialCost)} />
        <StatCard label="Business expenses" value={money(s.businessExpenses)} />
        <StatCard
          label="Net profit"
          value={money(s.netProfit)}
          tone={s.netProfit >= 0 ? "good" : "bad"}
        />
      </div>

      <Distribution profit={Math.max(0, s.netProfit)} />

      <CrudPage
        table="expenses"
        title="Expenses"
        subtitle="Everything you spend outside materials used in orders."
        addLabel="Add expense"
        fields={expenseFields}
        searchKeys={["name", "category"]}
        emptyText="No expenses recorded."
        transform={(v: Row) => ({
          ...v,
          expense_date: v.expense_date || new Date().toISOString().slice(0, 10),
        })}
        renderItem={(e: Row) => (
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-base font-semibold">{e.name}</p>
              <span className="font-semibold">{money(e.amount)}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {e.category} · {e.expense_date}
            </p>
            {e.description ? <p className="text-xs text-muted-foreground">{e.description}</p> : null}
          </div>
        )}
      />
    </div>
  );
}
