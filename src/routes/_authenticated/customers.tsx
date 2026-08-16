import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Phone } from "lucide-react";
import { CrudPage } from "@/components/crud-page";
import { money, num, orderRevenue, useRows, type Row } from "@/lib/db";
import { customerFields } from "@/lib/fields";

export const Route = createFileRoute("/_authenticated/customers")({
  head: () => ({
    meta: [
      { title: "Customers — Artiva Business" },
      { name: "description", content: "Your buyers, their orders and how much they spend." },
      { property: "og:title", content: "Customers — Artiva Business" },
      { property: "og:description", content: "Buyers, orders and spending history." },
    ],
  }),
  component: CustomersPage,
});

function CustomersPage() {
  const { data: orders = [] } = useRows("orders");

  return (
    <CrudPage
      table="customers"
      title="Customers"
      subtitle="Keep track of who buys what."
      addLabel="Add customer"
      fields={customerFields}
      searchKeys={["name", "phone", "instagram"]}
      emptyText="No customers yet."
      renderItem={(c: Row) => {
        const theirs = orders.filter(
          (o: Row) => o.customer_id === c.id || o.customer_name === c.name,
        );
        const spent = theirs
          .filter((o: Row) => o.status !== "Cancelled")
          .reduce((s: number, o: Row) => s + orderRevenue(o), 0);
        const last = theirs[0];
        return (
          <div className="space-y-2">
            <p className="font-display text-base font-semibold">{c.name}</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              {c.phone ? (
                <p className="flex items-center gap-1.5">
                  <Phone className="size-3.5" /> {c.phone}
                </p>
              ) : null}
              {c.instagram ? (
                <p className="flex items-center gap-1.5">
                  <Instagram className="size-3.5" /> {c.instagram}
                </p>
              ) : null}
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-secondary/60 p-2 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Orders</p>
                <p className="font-semibold">{theirs.length}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total spent</p>
                <p className="font-semibold">{money(spent)}</p>
              </div>
            </div>
            {last ? (
              <p className="text-xs text-muted-foreground">
                Last: {last.product_name} × {num(last.quantity)} ({last.order_date})
              </p>
            ) : null}
            {c.notes ? <p className="text-xs text-muted-foreground">{c.notes}</p> : null}
          </div>
        );
      }}
    />
  );
}
