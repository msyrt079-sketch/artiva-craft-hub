import { useEffect, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Row } from "@/lib/db";

export type FieldOption = { value: string; label: string };

export type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "date" | "textarea" | "select";
  options?: readonly string[] | FieldOption[];
  placeholder?: string | undefined;
  required?: boolean | undefined;
  full?: boolean | undefined;
  help?: string | undefined;
};

function normalizeOptions(options: Field["options"]): FieldOption[] {
  if (!options) return [];
  return (options as (string | FieldOption)[]).map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
}

export function RecordDialog({
  open,
  onOpenChange,
  title,
  description,
  fields,
  initial,
  onSubmit,
  extra,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string | undefined;
  fields: Field[];
  initial?: Row | undefined;
  onSubmit: (values: Row) => void | Promise<void>;
  extra?: ((values: Row) => ReactNode) | undefined;
  saving?: boolean | undefined;
}) {
  const [values, setValues] = useState<Row>({});

  useEffect(() => {
    if (!open) return;
    const base: Row = {};
    for (const f of fields) base[f.name] = initial?.[f.name] ?? "";
    if (initial?.id) base.id = initial.id;
    setValues(base);
  }, [open, initial, fields]);

  const set = (name: string, v: unknown) => setValues((p: Row) => ({ ...p, [name]: v }));

  const submit = () => {
    const payload: Row = { ...values };
    for (const f of fields) {
      if (f.type === "number") payload[f.name] = Number(payload[f.name] || 0);
      else if (payload[f.name] === "") payload[f.name] = null;
    }
    void onSubmit(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.name} className={f.full || f.type === "textarea" ? "col-span-2" : "col-span-1"}>
              <Label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {f.label}
              </Label>
              {f.type === "textarea" ? (
                <Textarea
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                  rows={3}
                />
              ) : f.type === "select" ? (
                <Select
                  value={values[f.name] ? String(values[f.name]) : ""}
                  onValueChange={(v) => set(f.name, v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose…" />
                  </SelectTrigger>
                  <SelectContent>
                    {normalizeOptions(f.options).map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                  step={f.type === "number" ? "any" : undefined}
                  value={values[f.name] ?? ""}
                  placeholder={f.placeholder}
                  onChange={(e) => set(f.name, e.target.value)}
                />
              )}
              {f.help ? <p className="mt-1 text-xs text-muted-foreground">{f.help}</p> : null}
            </div>
          ))}
        </div>
        {extra ? <div className="rounded-xl bg-secondary/60 p-3 text-sm">{extra(values)}</div> : null}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
