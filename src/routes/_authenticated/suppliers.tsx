import { createFileRoute } from "@tanstack/react-router";
import { Phone, Share2 } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { money, num, useRows, type Row } from "@/lib/db";
import { supplierFields } from "@/lib/fields";

export const Route = createFileRoute("/_authenticated/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers — Artiva Business" },
      { name: "description", content: "Where your yarn, clay and paint come from, and at what price." },
      { property: "og:title", content: "Suppliers — Artiva Business" },
      { property: "og:description", content: "Supplier contacts, materials and prices." },
    ],
  }),
  component: SuppliersPage,
});

function SuppliersPage() {
  const { data: materials = [] } = useRows("materials");

  return (
    <CrudPage
      table="suppliers"
      title="Suppliers"
      subtitle="Contacts and prices for everything you buy."
      addLabel="Add supplier"
      fields={supplierFields}
      searchKeys={["name", "phone", "materials_supplied"]}
      emptyText="No suppliers yet."
      renderItem={(s: Row) => {
        const theirs = materials.filter((m: Row) => m.supplier_id === s.id);
        const value = theirs.reduce(
          (t: number, m: Row) => t + num(m.quantity) * num(m.purchase_price),
          0,
        );
        return (
          <div className="space-y-2">
            <p className="font-display text-base font-semibold">{s.name}</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {s.phone ? (
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {s.phone}
                </p>
              ) : null}
              {s.social ? (
                <p className="flex items-center gap-1.5">
                  <Share2 className="size-3.5" /> {s.social}
                </p>
              ) : null}
            </div>
            {s.materials_supplied ? <p className="text-sm">{s.materials_supplied}</p> : null}
            {s.prices ? <p className="text-xs text-muted-foreground">{s.prices}</p> : null}
            <p className="text-xs text-muted-foreground">
              {theirs.length} material{theirs.length === 1 ? "" : "s"} · stock value {money(value)}
            </p>
          </div>
        );
      }}
    />
  );
}
