import { describe, it, expect } from "vitest";
import type { Product, StockMovement, Category } from "@/types";
import {
  filterMovementsByDate,
  computeSalesCostProfit,
  computeSalesByCategory,
  computeStockValueComposition,
  computeTopMovedProducts,
} from "@/features/reports/services/reportMetrics";
import { addDays } from "date-fns";

const products: Product[] = [
  {
    id: "p1",
    name: "Prod A",
    description: "",
    sku: "A1",
    categoryId: "c1",
    price: 50,
    cost: 20,
    currentStock: 10,
    minStock: 1,
    maxStock: 100,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "p2",
    name: "Prod B",
    description: "",
    sku: "B1",
    categoryId: "c2",
    price: 100,
    cost: 60,
    currentStock: 5,
    minStock: 1,
    maxStock: 100,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "p3",
    name: "Prod C",
    description: "",
    sku: "C1",
    categoryId: "c1",
    price: 30,
    cost: 10,
    currentStock: 3,
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

const today = new Date();
const movements: StockMovement[] = [
  {
    id: "m1",
    productId: "p1",
    productName: "Prod A",
    type: "ENTRADA",
    quantity: 4,
    reason: "",
    createdAt: today.toISOString(),
  },
  {
    id: "m2",
    productId: "p1",
    productName: "Prod A",
    type: "SAÍDA",
    quantity: 2,
    reason: "",
    createdAt: today.toISOString(),
  },
  {
    id: "m3",
    productId: "p2",
    productName: "Prod B",
    type: "SAÍDA",
    quantity: 1,
    reason: "",
    createdAt: today.toISOString(),
  },
  {
    id: "m4",
    productId: "p3",
    productName: "Prod C",
    type: "ENTRADA",
    quantity: 5,
    reason: "",
    createdAt: addDays(today, -10).toISOString(),
  },
];

describe("reportMetrics", () => {
  it("filtra movimentações por intervalo de datas", () => {
    const range = { from: addDays(today, -2), to: addDays(today, 1) };
    const filtered = filterMovementsByDate(movements, range);
    expect(filtered.length).toBe(3); // m4 fora do range
  });

  it("calcula vendas, custos e lucro corretamente", () => {
    const { totalSales, totalCost, grossProfit } = computeSalesCostProfit(
      movements,
      products
    );
    // Vendas: p1 (2 * 50) + p2 (1 * 100) = 200
    // Custos: p1 entrada (4 * 20) + p3 entrada (5 * 10) = 80 + 50 = 130
    expect(totalSales).toBe(200);
    expect(totalCost).toBe(130);
    expect(grossProfit).toBe(70);
  });

  it("agrega vendas por categoria", () => {
    const salesByCat = computeSalesByCategory(movements, products, categories);
    const cat1 = salesByCat.find((s) => s.name === "Cat1");
    const cat2 = salesByCat.find((s) => s.name === "Cat2");
    // Cat1 vendas: p1 SAÍDA 2 * 50 = 100
    // Cat2 vendas: p2 SAÍDA 1 * 100 = 100
    expect(cat1?.total).toBe(100);
    expect(cat2?.total).toBe(100);
  });

  it("calcula composição de valor de estoque", () => {
    const slices = computeStockValueComposition(products, categories);
    const cat1Slice = slices.find((s) => s.name === "Cat1");
    const cat2Slice = slices.find((s) => s.name === "Cat2");
    // Cat1: p1 (20*10) + p3 (10*3) = 200 + 30 = 230
    // Cat2: p2 (60*5) = 300
    expect(cat1Slice?.value).toBe(230);
    expect(cat2Slice?.value).toBe(300);
  });

  it("top produtos movimentados", () => {
    const top = computeTopMovedProducts(movements, products, 2);
    expect(top.length).toBe(2);
    // Totais: p1 (4 entradas + 2 saídas = 6), p3 (5 entradas), p2 (1 saída)
    expect(top[0].name).toBe("Prod A");
    expect(top[0].total).toBe(6);
    expect(top[1].name).toBe("Prod C");
    expect(top[1].total).toBe(5);
  });
});
