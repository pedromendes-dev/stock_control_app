import type { Product, StockMovement, Category } from "@/types";

export interface InventoryValuationResult {
  totalCost: number;
  totalPotentialRevenue: number;
  averageMarginPercent: number;
}

export function computeInventoryValuation(
  products: Product[]
): InventoryValuationResult {
  let costSum = 0;
  let revenueSum = 0;
  let marginAccum = 0;
  let marginCount = 0;
  for (const p of products) {
    costSum += p.currentStock * p.cost;
    revenueSum += p.currentStock * p.price;
    if (p.price > 0) {
      const margin = ((p.price - p.cost) / p.price) * 100;
      marginAccum += margin;
      marginCount++;
    }
  }
  return {
    totalCost: Number(costSum.toFixed(2)),
    totalPotentialRevenue: Number(revenueSum.toFixed(2)),
    averageMarginPercent: marginCount
      ? Number((marginAccum / marginCount).toFixed(2))
      : 0,
  };
}

export interface MovementCategorySummary {
  categoryId: string;
  categoryName: string;
  entries: number; // soma de quantidade de ENTRADA
  exits: number; // soma de quantidade de SAÍDA
  net: number; // entries - exits
}

export function summarizeMovementsByCategory(
  movements: StockMovement[],
  products: Product[],
  categories: Category[]
): MovementCategorySummary[] {
  const productMap = new Map(products.map((p) => [p.id, p]));
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));
  const acc = new Map<string, MovementCategorySummary>();

  for (const m of movements) {
    const prod = productMap.get(m.productId);
    if (!prod) continue;
    const cid = prod.categoryId;
    const cname = categoryMap.get(cid) || "Sem Categoria";
    if (!acc.has(cid)) {
      acc.set(cid, {
        categoryId: cid,
        categoryName: cname,
        entries: 0,
        exits: 0,
        net: 0,
      });
    }
    const summary = acc.get(cid)!;
    if (m.type === "ENTRADA") {
      summary.entries += m.quantity;
      summary.net += m.quantity;
    } else {
      summary.exits += m.quantity;
      summary.net -= m.quantity;
    }
  }

  return Array.from(acc.values()).sort((a, b) =>
    a.categoryName.localeCompare(b.categoryName)
  );
}
