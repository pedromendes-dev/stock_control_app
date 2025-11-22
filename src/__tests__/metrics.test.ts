import { describe, it, expect } from "vitest";
import {
  computeInventoryValuation,
  summarizeMovementsByCategory,
} from "@/services/metrics";
import type { Product, StockMovement, Category } from "@/types";

describe("metrics", () => {
  const products: Product[] = [
    {
      id: "p1",
      name: "A",
      description: "",
      sku: "A1",
      categoryId: "c1",
      price: 10,
      cost: 4,
      currentStock: 5,
      minStock: 1,
      maxStock: 100,
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "p2",
      name: "B",
      description: "",
      sku: "B1",
      categoryId: "c2",
      price: 20,
      cost: 10,
      currentStock: 2,
      minStock: 1,
      maxStock: 100,
      createdAt: "",
      updatedAt: "",
    },
  ];
  const categories: Category[] = [
    { id: "c1", name: "Cat1", description: "", createdAt: "" },
    { id: "c2", name: "Cat2", description: "", createdAt: "" },
  ];
  const movements: StockMovement[] = [
    {
      id: "m1",
      productId: "p1",
      productName: "A",
      type: "ENTRADA",
      quantity: 3,
      reason: "",
      createdAt: "",
    },
    {
      id: "m2",
      productId: "p1",
      productName: "A",
      type: "SAÍDA",
      quantity: 1,
      reason: "",
      createdAt: "",
    },
    {
      id: "m3",
      productId: "p2",
      productName: "B",
      type: "SAÍDA",
      quantity: 2,
      reason: "",
      createdAt: "",
    },
  ];

  it("calcula valuation correta", () => {
    const val = computeInventoryValuation(products);
    expect(val.totalCost).toBeCloseTo(5 * 4 + 2 * 10); // 20 + 20
    expect(val.totalPotentialRevenue).toBeCloseTo(5 * 10 + 2 * 20); // 50 + 40
    expect(val.averageMarginPercent).toBeGreaterThan(0);
  });

  it("resume movimentos por categoria", () => {
    const summary = summarizeMovementsByCategory(
      movements,
      products,
      categories
    );
    const cat1 = summary.find((s) => s.categoryId === "c1");
    const cat2 = summary.find((s) => s.categoryId === "c2");
    expect(cat1?.entries).toBe(3);
    expect(cat1?.exits).toBe(1);
    expect(cat1?.net).toBe(2);
    expect(cat2?.entries).toBe(0);
    expect(cat2?.exits).toBe(2);
    expect(cat2?.net).toBe(-2);
  });
});
