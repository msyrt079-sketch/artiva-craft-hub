import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { money, num, useSettings } from "@/lib/db";

export const Route = createFileRoute("/_authenticated/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing assistant — Artiva Business" },
      { name: "description", content: "Suggested prices from materials, time and target margin." },
      { property: "og:title", content: "Pricing assistant — Artiva Business" },
      { property: "og:description", content: "Price your handmade pieces fairly and profitably." },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { data: settings } = useSettings();
  const [materials, setMaterials] = useState("0");
  const [hours, setHours] = useState("1");
  const [rate, setRate] = useState("");
  const [overhead, setOverhead] = useState("0");
  const [margin, setMargin] = useState("40");

  const hourly = num(rate) || num(settings?.hourly_rate) || 10;
  const cost = num(materials) + num(hours) * hourly + num(overhead);
  const m = Math.min(95, Math.max(0, num(margin)));
  const suggested = m >= 95 ? cost * 2 : cost / (1 - m / 100);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Pricing assistant"
        subtitle="Never sell below what your work is worth."
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card-soft space-y-3 p-4">
          {[
            { label: "Material cost", value: materials, set: setMaterials },
            { label: "Production time (hours)", value: hours, set: setHours },
            { label: `Hourly rate (default ${hourly})`, value: rate, set: setRate },
            { label: "Overhead (packaging, delivery…)", value: overhead, set: setOverhead },
            { label: "Target profit margin (%)", value: margin, set: setMargin },
          ].map((f) => (
            <div key={f.label} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input type="number" value={f.value} onChange={(e) => f.set(e.target.value)} />
            </div>
          ))}
        </div>
        <div className="card-soft space-y-3 p-4">
          <div className="rounded-2xl bg-primary/10 p-4 text-center">
            <p className="text-sm text-muted-foreground">Suggested selling price</p>
            <p className="font-display text-3xl font-semibold">{money(suggested)}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="rounded-xl bg-secondary/60 p-3">Total cost: {money(cost)}</p>
            <p className="rounded-xl bg-secondary/60 p-3">Profit: {money(suggested - cost)}</p>
            <p className="rounded-xl bg-secondary/60 p-3">Labour: {money(num(hours) * hourly)}</p>
            <p className="rounded-xl bg-secondary/60 p-3">Margin: {m.toFixed(0)}%</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="font-semibold">Price ladder</p>
            {[20, 30, 40, 50, 60].map((p) => (
              <p key={p} className="flex justify-between text-muted-foreground">
                <span>{p}% margin</span>
                <span className="font-medium text-foreground">{money(cost / (1 - p / 100))}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
