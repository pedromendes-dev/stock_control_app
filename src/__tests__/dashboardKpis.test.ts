import { describe, it, expect, vi } from "vitest";
import { getDashboardData, getLowStockProducts } from "@/services/api";

vi.mock("@infra/supabase/client", () => ({
  supabase: {
    rpc: vi.fn((fn: string) => {
      if (fn === "get_dashboard_kpis") {
        return Promise.resolve({
          data: [{ kpis: { total_products: 2, low_stock_count: 1 } }],
          error: null,
        });
      }
      return Promise.resolve({ data: [], error: null });
    }),
    from: vi.fn(() => ({
      select: () => ({
        lte: () => ({
          limit: () =>
            Promise.resolve({
              data: [{ id: "p1", name: "P1", sku: "S1", current_stock: 3 }],
              error: null,
            }),
        }),
      }),
    })),
  },
}));

describe("dashboard supabase services", () => {
  it("getDashboardData retorna objeto esperado", async () => {
    const data = await getDashboardData();
    expect(data).toHaveProperty("kpis");
    expect(data.kpis.total_products).toBe(2);
  });

  it("getLowStockProducts executa filtros", async () => {
    const data = await getLowStockProducts();
    expect(Array.isArray(data)).toBe(true);
    expect(data[0]).toHaveProperty("current_stock");
  });
});
