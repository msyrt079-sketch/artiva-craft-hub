import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, PackagePlus } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adjustMaterialStock,
  money,
  num,
  useRows,
  useSaveRow,
  type Row,
} from "@/lib/db";
import { materialFields } from "@/lib/fields";
import { lowStockMaterials } from "@/lib/insights";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/materials")({
  head: () => ({
    meta: [
      { title: "Materials — Artiva Business" },
      { name: "description", content: "Track yarn, clay, paint and packaging with low-stock alerts." },
      { property: "og:title", content: "Materials — Artiva Business" },
      { property: "og:description", content: "Material stock and low-stock alerts." },
    ],
  }),
  component: MaterialsPage,
});

function Restock({ material }: { material: Row }) {
  const [qty, setQty] = useState("");
  const qc = useQueryClient();
  const saveExpense = useSaveRow("expenses");
  return (
    <div className="flex gap-2">
      <Input
        value={qty}
        onChange={(e) => setQty(e.target.value)}
        placeholder={`Add ${material.unit}`}
        type="number"
        className="h-9"
      />
      <Button
        size="sm"
        variant="secondary"
        onClick={async () => {
          const amount = num(qty);
          if (amount <= 0) return;
          await adjustMaterialStock(material.id, amount);
          await saveExpense.mutateAsync({
            name: `Restock ${material.name}`,
            amount: amount * num(material.purchase_price),
            category: "Materials",
            expense_date: new Date().toISOString().slice(0, 10),
          });
          setQty("");
          qc.invalidateQueries();
          toast.success("Stock updated");
        }}
      >
        <PackagePlus className="size-4" /> Restock
      </Button>
    </div>
  );
}

function MaterialsPage() {
  const { data: suppliers = [] } = useRows("suppliers");

  return (
    <CrudPage
      table="materials"
      title="Materials"
      subtitle="Stock decreases automatically when an order uses a product recipe."
      addLabel="Add material"
      fields={materialFields(suppliers)}
      searchKeys={["name", "category", "unit"]}
      emptyText="No materials yet."
      banner={(rows: Row[]) => {
        const low = lowStockMaterials(rows);
        if (low.length === 0) return null;
        return (
          <div className="rounded-2xl border border-warning/50 bg-warning/15 p-4">
            <p className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="size-4" /> {low.length} material
              {low.length > 1 ? "s" : ""} running low
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {low.map((m: Row) => `${m.name} (${num(m.quantity)} ${m.unit})`).join(" · ")}
            </p>
          </div>
        );
      }}
      renderItem={(m: Row) => {
        const isLow = num(m.quantity) <= num(m.min_stock);
        const supplier = suppliers.find((s: Row) => s.id === m.supplier_id);
        return (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display text-base font-semibold">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.category}</p>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isLow ? "bg-destructive/15 text-destructive" : "bg-success/20 text-foreground"
                }`}
              >
                {num(m.quantity)} {m.unit}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <p>Unit price: {money(m.purchase_price)}</p>
              <p>Min stock: {num(m.min_stock)}</p>
              <p>Stock value: {money(num(m.quantity) * num(m.purchase_price))}</p>
              <p>{supplier ? supplier.name : "No supplier"}</p>
            </div>
            <Restock material={m} />
          </div>
        );
      }}
    />
  );
}
