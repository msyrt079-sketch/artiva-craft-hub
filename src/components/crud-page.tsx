import { useMemo, useState, type ReactNode } from "react";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RecordDialog, type Field } from "@/components/record-dialog";
import { PageHeader } from "@/components/page-header";
import { useDeleteRow, useRows, useSaveRow, type Row, type TableName } from "@/lib/db";

export function CrudPage({
  table,
  title,
  subtitle,
  fields,
  addLabel,
  searchKeys = ["name"],
  renderItem,
  emptyText = "Nothing here yet.",
  banner,
  extra,
  transform,
}: {
  table: TableName;
  title: string;
  subtitle?: string;
  fields: Field[];
  addLabel: string;
  searchKeys?: string[];
  renderItem: (row: Row) => ReactNode;
  emptyText?: string;
  banner?: (rows: Row[]) => ReactNode;
  extra?: (values: Row) => ReactNode;
  transform?: (values: Row) => Row;
}) {
  const { data: rows = [], isLoading } = useRows(table);
  const save = useSaveRow(table);
  const remove = useDeleteRow(table);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Row | undefined>(undefined);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const t = q.toLowerCase();
    return rows.filter((r: Row) =>
      searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(t)),
    );
  }, [rows, q, searchKeys]);

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <Button
            onClick={() => {
              setEditing(undefined);
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> {addLabel}
          </Button>
        }
      />

      {banner?.(rows)}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="card-soft px-4 py-10 text-center text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((row: Row) => (
            <div key={row.id} className="card-soft card-soft-hover p-4">
              {renderItem(row)}
              <div className="mt-3 flex justify-end gap-1 border-t border-border/70 pt-3">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setEditing(row);
                    setOpen(true);
                  }}
                >
                  <Pencil className="size-4" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove.mutate(row.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RecordDialog
        open={open}
        onOpenChange={setOpen}
        title={editing ? `Edit ${title.replace(/s$/, "")}` : addLabel}
        fields={fields}
        initial={editing}
        extra={extra}
        saving={save.isPending}
        onSubmit={async (values) => {
          await save.mutateAsync(transform ? transform(values) : values);
          setOpen(false);
        }}
      />
    </div>
  );
}
