import type { Product, Category, StockMovement } from "@/types";

// Product DB row (union of possible snake/camel cases we encountered)
interface DbProductRow {
  id: string;
  name: string;
  description?: string | null;
  sku: string;
  category_id?: string | null;
  categoryId?: string | null;
  price?: number | null;
  cost?: number | null;
  current_stock?: number | null;
  currentStock?: number | null;
  min_stock?: number | null;
  minStock?: number | null;
  max_stock?: number | null;
  maxStock?: number | null;
  created_at?: string | null;
  createdAt?: string | null;
  updated_at?: string | null;
  updatedAt?: string | null;
  categories?: { name: string } | null;
}

export function mapDbProductRow(row: DbProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    sku: row.sku,
    categoryId: row.category_id ?? row.categoryId ?? "",
    price: row.price ?? 0,
    cost: row.cost ?? 0,
    currentStock: row.current_stock ?? row.currentStock ?? 0,
    minStock: row.min_stock ?? row.minStock ?? 0,
    maxStock: row.max_stock ?? row.maxStock ?? 0,
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
    updatedAt:
      row.updated_at ??
      row.updatedAt ??
      row.created_at ??
      new Date().toISOString(),
  };
}

interface DbCategoryRow {
  id: string;
  name: string;
  description?: string | null;
  created_at?: string | null;
}

export function mapDbCategoryRow(row: DbCategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

interface DbStockMovementRow {
  id: string;
  product_id?: string;
  productId?: string;
  products?: { name: string } | null;
  product_name?: string;
  productName?: string;
  type: "ENTRADA" | "SAÍDA";
  quantity: number;
  reason?: string | null;
  created_at?: string;
  createdAt?: string;
}

export function mapDbStockMovementRow(row: DbStockMovementRow): StockMovement {
  return {
    id: row.id,
    productId: row.product_id ?? row.productId ?? "",
    productName:
      row.products?.name ?? row.product_name ?? row.productName ?? "Produto",
    type: row.type,
    quantity: row.quantity,
    reason: row.reason ?? "-",
    createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  };
}
