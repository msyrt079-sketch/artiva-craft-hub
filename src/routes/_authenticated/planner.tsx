import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/crud-page";
import { Checkbox } from "@/components/ui/checkbox";
import { num, useRows, useSaveRow, useDeleteRow, type Row } from "@/lib/db";
import { productionFields, taskFields } from "@/lib/fields";

export const Route = createFileRoute("/_authenticated/planner")({
  head: () => ({
    meta: [
      { title: "Planner — Artiva Business" },
      { name: "description", content: "Production queue and daily to-do list for your studio." },
      { property: "og:title", content: "Planner — Artiva Business" },
      { property: "og:description", content: "Production queue and daily tasks." },
    ],
  }),
  component: PlannerPage,
});

const tone: Record<string, string> = {
  Urgent: "bg-destructive/15 text-destructive",
  High: "bg-warning/25 text-foreground",
  Medium: "bg-secondary text-secondary-foreground",
  Low: "bg-muted text-muted-foreground",
};

function DailyTasks() {
  const { data: tasks = [] } = useRows("tasks");
  const save = useSaveRow("tasks");
  const remove = useDeleteRow("tasks");
  return (
    <div className="card-soft space-y-2 p-4">
      <h2 className="font-display text-base font-semibold">Daily tasks</h2>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No tasks yet — add one below.</p>
      ) : (
        tasks.map((t: Row) => (
          <label
            key={t.id}
            className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2 text-sm"
          >
            <Checkbox
              checked={!!t.done}
              onCheckedChange={(v) => save.mutate({ id: t.id, done: !!v })}
            />
            <span className={t.done ? "line-through opacity-60" : ""}>{t.title}</span>
            <span className="ml-auto text-xs text-muted-foreground">{t.due_date}</span>
            <button className="text-xs text-destructive" onClick={() => remove.mutate(t.id)}>
              Remove
            </button>
          </label>
        ))
      )}
    </div>
  );
}

function PlannerPage() {
  return (
    <div className="space-y-6">
      <CrudPage
        table="production_tasks"
        title="Production planner"
        subtitle="What to make next, and by when."
        addLabel="Add to queue"
        fields={productionFields}
        searchKeys={["product_name", "customer_name", "status", "priority"]}
        emptyText="Nothing in the production queue."
        renderItem={(t: Row) => (
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="font-display text-base font-semibold">
                {t.product_name} × {num(t.quantity)}
              </p>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${tone[t.priority] ?? ""}`}>
                {t.priority}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {t.customer_name || "Stock"} · {t.status}
              {t.deadline ? ` · due ${t.deadline}` : ""}
            </p>
          </div>
        )}
      />
      <DailyTasks />
      <CrudPage
        table="tasks"
        title="Add a task"
        subtitle="Small daily reminders for your studio routine."
        addLabel="New task"
        fields={taskFields}
        searchKeys={["title"]}
        emptyText=""
        renderItem={() => null}
        transform={(v: Row) => ({
          ...v,
          due_date: v.due_date || new Date().toISOString().slice(0, 10),
        })}
      />
    </div>
  );
}
