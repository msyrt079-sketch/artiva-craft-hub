import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  adjustMaterialStock,
  categoryClass,
  money,
  num,
  orderProfit,
  orderRevenue,
  useRows,
  type Row,
} from "@/lib/db";
import { orderFields } from "@/lib/fields";

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Artiva Business" },
      { name: "description", content: "Track every commande: status, payment, costs and profit." },
      { property: "og:title", content: "Orders — Artiva Business" },
      { property: "og:description", content: "Track every order, payment and profit." },
    ],
  }),
  component: OrdersPage,
});

const statusTone: Record<string, string> = {
  New: "bg-accent text-accent-foreground",
  "In production": "bg-warning/25 text-foreground",
  Ready: "bg-crochet/25 text-foreground",
  Delivered: "bg-success/20 text-foreground",
  Cancelled: "bg-destructive/15 text-destructive",
};

function OrdersPage() {
  const { data: products = [] } = useRows("products");
  const { data: customers = [] } = useRows("customers");
  const { data: orders = [] } = useRows("orders");

  const nextNumber = `#${String(orders.length + 1).padStart(3, "0")}`;

  return (
    <CrudPage
      table="orders"
      title="Orders"
      subtitle="Profit is calculated automatically: price − materials − other costs."
      addLabel="New order"
      fields={orderFields(products, customers)}
      searchKeys={["order_number", "customer_name", "product_name", "status"]}
      emptyText="No orders yet. Create your first commande."
      transform={(v: Row) => {
        const product = products.find((p: Row) => p.name === v.product_name);
        const customer = customers.find((c: Row) => c.name === v.customer_name);
        return {
          ...v,
          order_number: v.order_number || nextNumber,
          order_date: v.order_date || new Date().toISOString().slice(0, 10),
          quantity: num(v.quantity) || 1,
          status: v.status || "New",
          payment_status: v.payment_status || "Unpaid",
          category: v.category || product?.category || "Crochet",
          product_id: product?.id ?? null,
          customer_id: customer?.id ?? null,
          customer_phone: v.customer_phone || customer?.phone || null,
          material_cost:
            num(v.material_cost) ||
            num(product?.production_cost) * (num(v.quantity) || 1),
          selling_price: num(v.selling_price) || num(product?.selling_price),
        };
      }}
      afterSave={async (_id, values, isNew) => {
        if (!isNew) return;
        const product = products.find((p: Row) => p.name === values.product_name);
        if (!product) return;
        const qty = num(values.quantity) || 1;
        const { data: recipe } = await supabase
          .from("product_materials")
          .select("material_id, quantity")
          .eq("product_id", product.id);
        for (const line of (recipe ?? []) as Row[]) {
          if (line.material_id) await adjustMaterialStock(line.material_id, -num(line.quantity) * qty);
        }
        if (num(product.stock_quantity) > 0) {
          await supabase
            .from("products")
            .update({ stock_quantity: Math.max(0, num(product.stock_quantity) - qty) })
            .eq("id", product.id);
        }
      }}
      renderItem={(o: Row) => (
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-display text-base font-semibold">{o.order_number}</p>
              <p className="text-sm text-muted-foreground">{o.customer_name}</p>
            </div>
            <Badge className={statusTone[o.status] ?? "bg-muted"}>{o.status}</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className={`rounded-full px-2 py-0.5 font-medium ${categoryClass(o.category)}`}>
              {o.category}
            </span>
            <span className="rounded-full bg-muted px-2 py-0.5">{o.payment_status}</span>
            {o.delivery_date ? (
              <span className="rounded-full bg-muted px-2 py-0.5">Due {o.delivery_date}</span>
            ) : null}
          </div>
          <p className="text-sm">
            {o.product_name} × {num(o.quantity)}
          </p>
          <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/60 p-2 text-center text-xs">
            <div>
              <p className="text-muted-foreground">Total</p>
              <p className="font-semibold">{money(orderRevenue(o))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Costs</p>
              <p className="font-semibold">{money(num(o.material_cost) + num(o.other_costs))}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Profit</p>
              <p className={`font-semibold ${orderProfit(o) >= 0 ? "text-success" : "text-destructive"}`}>
                {money(orderProfit(o))}
              </p>
            </div>
          </div>
          {o.notes ? <p className="text-xs text-muted-foreground">{o.notes}</p> : null}
        </div>
      )}
    />
  );
}
