import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type Row = Record<string, any>;

export type TableName =
  | "customers"
  | "suppliers"
  | "materials"
  | "products"
  | "product_materials"
  | "orders"
  | "expenses"
  | "tasks"
  | "production_tasks"
  | "goals"
  | "settings";

export const CURRENCY = "TND";

export function money(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return `${v.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${CURRENCY}`;
}

export function num(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export const PRODUCT_CATEGORIES = ["Crochet", "Ceramics", "Painting"] as const;
export const ORDER_STATUSES = ["New", "In production", "Ready", "Delivered", "Cancelled"] as const;
export const PAYMENT_STATUSES = ["Unpaid", "Partially paid", "Fully paid"] as const;
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"] as const;
export const EXPENSE_CATEGORIES = [
  "Materials",
  "Packaging",
  "Delivery",
  "Advertising",
  "Tools",
  "Transportation",
  "Other",
] as const;
export const MATERIAL_CATEGORIES = [
  "Yarn",
  "Clay",
  "Paint",
  "Brushes",
  "Packaging",
  "Hardware",
  "Glue",
  "Beads",
  "Thread",
  "Other",
] as const;

export function categoryClass(category?: string | null) {
  switch (category) {
    case "Ceramics":
      return "bg-ceramics/25 text-foreground";
    case "Painting":
      return "bg-painting/25 text-foreground";
    case "Crochet":
      return "bg-crochet/25 text-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
}

export function orderRevenue(o: Row) {
  return num(o.selling_price) * num(o.quantity);
}

export function orderProfit(o: Row) {
  return orderRevenue(o) - num(o.material_cost) - num(o.other_costs);
}

const ORDER_BY: Partial<Record<TableName, { column: string; asc: boolean }>> = {
  orders: { column: "order_date", asc: false },
  expenses: { column: "expense_date", asc: false },
  materials: { column: "name", asc: true },
  products: { column: "name", asc: true },
  customers: { column: "name", asc: true },
  suppliers: { column: "name", asc: true },
  tasks: { column: "created_at", asc: false },
  production_tasks: { column: "deadline", asc: true },
  goals: { column: "created_at", asc: false },
  product_materials: { column: "created_at", asc: true },
};

export function useRows(table: TableName, enabled = true) {
  return useQuery({
    queryKey: [table],
    enabled,
    queryFn: async (): Promise<Row[]> => {
      const order = ORDER_BY[table];
      let q = supabase.from(table).select("*");
      if (order) q = q.order(order.column, { ascending: order.asc, nullsFirst: false });
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as Row[];
    },
  });
}

async function currentUserId() {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error("Not signed in");
  return data.user.id;
}

export function useSaveRow(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Row) => {
      const { id, ...rest } = values;
      if (id) {
        const { error } = await supabase.from(table).update(rest).eq("id", id);
        if (error) throw error;
        return id as string;
      }
      const payload = { ...rest, user_id: await currentUserId() };
      const { data, error } = await supabase.from(table).insert(payload).select("id").single();
      if (error) throw error;
      return (data as Row).id as string;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useDeleteRow(table: TableName) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries();
      toast.success("Deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async (): Promise<Row | null> => {
      const { data, error } = await supabase.from("settings").select("*").maybeSingle();
      if (error) throw error;
      if (data) return data as Row;
      const { data: created, error: e2 } = await supabase
        .from("settings")
        .insert({ user_id: await currentUserId() })
        .select("*")
        .single();
      if (e2) throw e2;
      return created as Row;
    },
  });
}

export function useSaveSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: Row) => {
      const { error } = await supabase
        .from("settings")
        .update(values)
        .eq("user_id", await currentUserId());
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings saved");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

/** Adjust a material's stock quantity (used by orders + purchases). */
export async function adjustMaterialStock(materialId: string, delta: number) {
  const { data, error } = await supabase
    .from("materials")
    .select("quantity")
    .eq("id", materialId)
    .single();
  if (error) throw error;
  const next = num((data as Row).quantity) + delta;
  const { error: e2 } = await supabase
    .from("materials")
    .update({ quantity: next < 0 ? 0 : next })
    .eq("id", materialId);
  if (e2) throw e2;
}
