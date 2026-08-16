import type { Field } from "@/components/record-dialog";
import {
  EXPENSE_CATEGORIES,
  MATERIAL_CATEGORIES,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  PRIORITIES,
  PRODUCT_CATEGORIES,
  type Row,
  type TableName,
} from "@/lib/db";

const today = () => new Date().toISOString().slice(0, 10);

export function orderFields(products: Row[], customers: Row[]): Field[] {
  return [
    { name: "order_number", label: "Order number", placeholder: "#001" },
    {
      name: "customer_name",
      label: "Customer",
      type: customers.length ? "select" : "text",
      options: customers.map((c: Row) => ({ value: c.name, label: c.name })),
    },
    { name: "customer_phone", label: "Phone" },
    {
      name: "product_name",
      label: "Product",
      type: products.length ? "select" : "text",
      options: products.map((p: Row) => ({ value: p.name, label: p.name })),
    },
    { name: "category", label: "Category", type: "select", options: PRODUCT_CATEGORIES },
    { name: "quantity", label: "Quantity", type: "number" },
    { name: "selling_price", label: "Selling price (unit)", type: "number" },
    { name: "material_cost", label: "Material cost", type: "number" },
    { name: "other_costs", label: "Other costs", type: "number" },
    { name: "order_date", label: "Order date", type: "date" },
    { name: "delivery_date", label: "Delivery date", type: "date" },
    { name: "payment_status", label: "Payment", type: "select", options: PAYMENT_STATUSES },
    { name: "status", label: "Order status", type: "select", options: ORDER_STATUSES },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
}

export const productFields: Field[] = [
  { name: "name", label: "Product name" },
  { name: "category", label: "Category", type: "select", options: PRODUCT_CATEGORIES },
  { name: "photo_url", label: "Photo URL", full: true, placeholder: "https://…" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "production_cost", label: "Production cost", type: "number" },
  { name: "selling_price", label: "Selling price", type: "number" },
  { name: "stock_quantity", label: "Stock quantity", type: "number" },
  { name: "production_hours", label: "Production time (h)", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["Active", "Draft", "Archived"] },
];

export function materialFields(suppliers: Row[]): Field[] {
  return [
    { name: "name", label: "Material name" },
    { name: "category", label: "Category", type: "select", options: MATERIAL_CATEGORIES },
    { name: "quantity", label: "Quantity available", type: "number" },
    { name: "unit", label: "Unit", placeholder: "g, m, pcs" },
    { name: "purchase_price", label: "Purchase price", type: "number" },
    {
      name: "supplier_id",
      label: "Supplier",
      type: "select",
      options: suppliers.map((s: Row) => ({ value: s.id, label: s.name })),
    },
    { name: "min_stock", label: "Minimum stock", type: "number" },
    { name: "purchased_at", label: "Date purchased", type: "date" },
    { name: "notes", label: "Notes", type: "textarea" },
  ];
}

export const customerFields: Field[] = [
  { name: "name", label: "Name" },
  { name: "phone", label: "Phone" },
  { name: "instagram", label: "Instagram", placeholder: "@artiva" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export const supplierFields: Field[] = [
  { name: "name", label: "Supplier name" },
  { name: "phone", label: "Phone" },
  { name: "social", label: "Instagram / Facebook" },
  { name: "materials_supplied", label: "Materials supplied", full: true },
  { name: "prices", label: "Prices", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" },
];

export const expenseFields: Field[] = [
  { name: "name", label: "Expense name" },
  { name: "amount", label: "Amount", type: "number" },
  { name: "category", label: "Category", type: "select", options: EXPENSE_CATEGORIES },
  { name: "expense_date", label: "Date", type: "date" },
  { name: "description", label: "Description", type: "textarea" },
];

export const productionFields: Field[] = [
  { name: "product_name", label: "Product" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "deadline", label: "Deadline", type: "date" },
  { name: "priority", label: "Priority", type: "select", options: PRIORITIES },
  { name: "customer_name", label: "Customer" },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: ["Planned", "In progress", "Done"],
  },
];

export const taskFields: Field[] = [
  { name: "title", label: "Task", full: true, placeholder: "Package 3 orders" },
  { name: "due_date", label: "Date", type: "date" },
];

export const goalFields: Field[] = [
  {
    name: "kind",
    label: "Goal type",
    type: "select",
    options: [
      { value: "revenue", label: "Revenue" },
      { value: "profit", label: "Profit" },
      { value: "orders", label: "Number of orders" },
      { value: "products", label: "Number of products" },
    ],
  },
  { name: "target", label: "Target", type: "number" },
  {
    name: "period",
    label: "Period",
    type: "select",
    options: [
      { value: "month", label: "This month" },
      { value: "year", label: "This year" },
    ],
  },
];

export type QuickAction = {
  label: string;
  table: TableName;
  fields: Field[];
  transform?: (values: Row) => Row;
};

export function quickActions({
  products,
  customers,
  materials: _materials,
}: {
  products: Row[];
  customers: Row[];
  materials: Row[];
}): QuickAction[] {
  return [
    {
      label: "New order",
      table: "orders",
      fields: orderFields(products, customers),
      transform: (v: Row) => ({
        ...v,
        order_date: v.order_date || today(),
        quantity: v.quantity || 1,
        status: v.status || "New",
        payment_status: v.payment_status || "Unpaid",
        category: v.category || "Crochet",
      }),
    },
    { label: "New product", table: "products", fields: productFields },
    { label: "Add material", table: "materials", fields: materialFields([]) },
    {
      label: "Expense",
      table: "expenses",
      fields: expenseFields,
      transform: (v: Row) => ({ ...v, expense_date: v.expense_date || today() }),
    },
    { label: "Customer", table: "customers", fields: customerFields },
    { label: "Production task", table: "production_tasks", fields: productionFields },
  ];
}
