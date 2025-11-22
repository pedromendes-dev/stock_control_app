import type { Product, StockMovement, Category } from "@/types";
import { DateRange } from "react-day-picker";

type GenericMovement = StockMovement & {
  product_id?: string;
  created_at?: string;
};

// Normaliza id do produto em uma movimentação (suporta camelCase ou snake_case)
function getMovementProductId(m: GenericMovement): string | undefined {
  return m.productId || m.product_id;
}

function getMovementCreatedAt(m: GenericMovement): Date | null {
  const raw = m.createdAt || m.created_at;
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
}

export function filterMovementsByDate(
  movements: GenericMovement[],
  range?: DateRange
): GenericMovement[] {
  if (!range?.from || !range?.to) return movements;
  const from = range.from;
  const to = range.to;
  return movements.filter((m) => {
    const d = getMovementCreatedAt(m);
    return !d || (d >= from && d <= to);
  });
}

export interface SalesCostProfit {
  totalSales: number;
  totalCost: number;
  grossProfit: number;
}

export function computeSalesCostProfit(
  movements: GenericMovement[],
  products: Product[]
): SalesCostProfit {
  const productMap = new Map(products.map((p) => [p.id, p]));
  let sales = 0;
  let cost = 0;
  for (const m of movements) {
    const pid = getMovementProductId(m);
    const prod = productMap.get(pid!);
    if (!prod) continue;
    const qty = (m.quantity ?? 0) as number;
    if (m.type === "SAÍDA") sales += prod.price * qty;
    else if (m.type === "ENTRADA") cost += prod.cost * qty;
  }
  return { totalSales: sales, totalCost: cost, grossProfit: sales - cost };
}

export interface CategorySales {
  name: string;
  total: number;
}

export function computeSalesByCategory(
  movements: GenericMovement[],
  products: Product[],
  categories: Category[]
): CategorySales[] {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const acc = new Map<string, number>();
  for (const m of movements) {
    if (m.type !== "SAÍDA") continue;
    const pid = getMovementProductId(m);
    const prod = productMap.get(pid!);
    if (!prod) continue;
    const prev = acc.get(prod.categoryId) || 0;
    acc.set(prod.categoryId, prev + prod.price * (m.quantity ?? 0));
  }
  return Array.from(acc.entries()).map(([cid, total]) => ({
    name: categoryMap.get(cid) || "Sem Categoria",
    total,
  }));
}

export interface StockValueSlice {
  name: string;
  value: number;
}

export function computeStockValueComposition(
  products: Product[],
  categories: Category[]
): StockValueSlice[] {
  return categories.map((c) => ({
    name: c.name,
    value: products
      .filter((p) => p.categoryId === c.id)
      .reduce((acc, p) => acc + p.cost * p.currentStock, 0),
  }));
}

export interface TopMoved {
  name: string;
  entries: number;
  exits: number;
  total: number;
}

export function computeTopMovedProducts(
  movements: GenericMovement[],
  products: Product[],
  limit = 5
): TopMoved[] {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const acc: Record<string, TopMoved> = {};
  for (const m of movements) {
    const pid = getMovementProductId(m);
    const prod = productMap.get(pid!);
    if (!prod) continue;
    if (!acc[pid!])
      acc[pid!] = { name: prod.name, entries: 0, exits: 0, total: 0 };
    const qty = (m.quantity ?? 0) as number;
    if (m.type === "ENTRADA") acc[pid!].entries += qty;
    else acc[pid!].exits += qty;
    acc[pid!].total += qty;
  }
  return Object.values(acc)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

export function formatCurrencyBRL(value: number) {
  return value.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}
