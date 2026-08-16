import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Layers, Trash2 } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { categoryClass, money, num, useRows, type Row } from "@/lib/db";
import { productFields } from "@/lib/fields";

export const Route = createFileRoute("/_authenticated/products")({
  head: () => ({
    meta: [
      { title: "Products — Artiva Business" },
      {
        name: "description",
        content: "Crochet, ceramics and paintings with recipes, costs, margins and stock.",
      },
      { property: "og:title", content: "Products — Artiva Business" },
      { property: "og:description", content: "Your handmade catalogue with costs and margins." },
    ],
  }),
  component: ProductsPage,
});

function RecipeDialog({ product, onClose }: { product: Row; onClose: () => void }) {
  const { data: materials = [] } = useRows("materials");
  const { data: lines = [] } = useRows("product_materials");
  const qc = useQueryClient();
  const [materialId, setMaterialId] = useState("");
  const [qty, setQty] = useState("1");

  const recipe = lines.filter((l: Row) => l.product_id === product.id);
  const total = recipe.reduce((s: number, l: Row) => s + num(l.cost), 0);

  async function addLine(): Promise<void> {
    const material = materials.find((m: Row) => m.id === materialId);
    if (!material) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const quantity = num(qty) || 1;
    const { error } = await supabase.from("product_materials").insert({
      user_id: user.user.id,
      product_id: product.id,
      material_id: material.id,
      material_name: material.name,
      quantity,
      cost: quantity * num(material.purchase_price),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    setMaterialId("");
    setQty("1");
    qc.invalidateQueries();
  }

  async function applyCost(): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ production_cost: total })
      .eq("id", product.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    qc.invalidateQueries();
    toast.success("Production cost updated");
  }

  return (
    <Dialog open onOpenChange={(v) => (v ? null : onClose())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">Recipe — {product.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {recipe.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Add the materials used to make one unit. Stock is deducted automatically per order.
            </p>
          ) : (
            <ul className="space-y-2">
              {recipe.map((l: Row) => (
                <li
                  key={l.id}
                  className="flex items-center justify-between rounded-xl bg-secondary/60 px-3 py-2 text-sm"
                >
                  <span>
                    {l.material_name} × {num(l.quantity)}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{money(l.cost)}</span>
                    <button
                      className="text-destructive"
                      onClick={async () => {
                        await supabase.from("product_materials").delete().eq("id", l.id);
                        qc.invalidateQueries();
                      }}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}

          <div className="grid grid-cols-[1fr_auto_auto] gap-2">
            <Select value={materialId} onValueChange={setMaterialId}>
              <SelectTrigger>
                <SelectValue placeholder="Material" />
              </SelectTrigger>
              <SelectContent>
                {materials.map((m: Row) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name} ({money(m.purchase_price)}/{m.unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-20"
            />
            <Button onClick={addLine}>Add</Button>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2">
            <span className="text-sm font-semibold">Material cost / unit</span>
            <span className="font-display text-lg font-semibold">{money(total)}</span>
          </div>
          <Button className="w-full" variant="secondary" onClick={applyCost}>
            Use as production cost
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProductsPage() {
  const [recipeFor, setRecipeFor] = useState<Row | null>(null);

  return (
    <>
      <CrudPage
        table="products"
        title="Products"
        subtitle="Each category keeps its own colour identity."
        addLabel="New product"
        fields={productFields}
        searchKeys={["name", "category", "status"]}
        emptyText="No products yet."
        renderItem={(p: Row) => {
          const price = num(p.selling_price);
          const margin = price > 0 ? ((price - num(p.production_cost)) / price) * 100 : 0;
          return (
            <div className="space-y-2">
              <div
                className={`-m-4 mb-2 flex h-28 items-center justify-center overflow-hidden rounded-t-2xl ${categoryClass(
                  p.category,
                )}`}
              >
                {p.photo_url ? (
                  <img
                    src={p.photo_url}
                    alt={`${p.name} — handmade ${p.category}`}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="font-display text-lg">{p.category}</span>
                )}
              </div>
              <div className="flex items-start justify-between gap-2 pt-2">
                <div>
                  <p className="font-display text-base font-semibold">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.status}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryClass(p.category)}`}>
                  {p.category}
                </span>
              </div>
              {p.description ? (
                <p className="line-clamp-2 text-xs text-muted-foreground">{p.description}</p>
              ) : null}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <p>Cost: {money(p.production_cost)}</p>
                <p>Price: {money(p.selling_price)}</p>
                <p>Stock: {num(p.stock_quantity)}</p>
                <p>Time: {num(p.production_hours)} h</p>
              </div>
              <p
                className={`text-sm font-semibold ${margin >= 30 ? "text-success" : margin >= 15 ? "text-foreground" : "text-destructive"}`}
              >
                Profit {money(price - num(p.production_cost))} · {margin.toFixed(0)}% margin
              </p>
              <Button size="sm" variant="secondary" onClick={() => setRecipeFor(p)}>
                <Layers className="size-4" /> Recipe
              </Button>
            </div>
          );
        }}
      />
      {recipeFor ? <RecipeDialog product={recipeFor} onClose={() => setRecipeFor(null)} /> : null}
    </>
  );
}
