import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useRows } from "@/lib/db";
import { buildNotifications } from "@/lib/insights";

export function NotificationBell() {
  const { data: orders = [] } = useRows("orders");
  const { data: materials = [] } = useRows("materials");
  const { data: products = [] } = useRows("products");
  const { data: expenses = [] } = useRows("expenses");

  const notes = buildNotifications(orders, materials, products, expenses);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="size-4" />
          {notes.length > 0 ? (
            <span className="absolute right-1.5 top-1.5 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {notes.length > 9 ? "9+" : notes.length}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <p className="border-b border-border px-4 py-3 font-display text-sm font-semibold">
          Notifications
        </p>
        <div className="max-h-80 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">All clear ✨</p>
          ) : (
            notes.map((n, i) => (
              <div key={i} className="flex gap-2 border-b border-border/60 px-4 py-2.5 text-sm last:border-0">
                <span>{n.icon}</span>
                <span
                  className={
                    n.tone === "warn"
                      ? "text-destructive"
                      : n.tone === "good"
                        ? "text-success"
                        : "text-foreground"
                  }
                >
                  {n.text}
                </span>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
