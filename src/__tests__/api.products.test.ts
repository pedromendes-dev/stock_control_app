/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProducts, addProduct, updateProduct } from "@/services/api";
import type { Product } from "@/types";
import { supabase } from "@infra/supabase/client";

// Mantém apenas uma definição de mock limpa
vi.mock("@infra/supabase/client", () => {
  function buildQuery(data: any[]) {
    const q: any = {};
    q.select = vi.fn(() => q);
    q.order = vi.fn(() => q);
    q.range = vi.fn(() => q);
    q.ilike = vi.fn(() => q);
    q.then = (resolve: any) =>
      resolve({ data, error: null, count: data.length });
    return q;
  }
  const insertResult = {
    id: "new-id",
    name: "Novo",
    description: "D",
    sku: "SKU-NEW",
    category_id: "c1",
    price: 9,
    cost: 4,
    current_stock: 1,
    min_stock: 0,
    max_stock: 10,
    created_at: "2024-01-10",
    updated_at: "2024-01-10",
  };
  return {
    supabase: {
      from: vi.fn((table: string) => {
        if (table === "products") {
          return buildQuery([
            {
              id: "p1",
              name: "Produto 1",
              description: "Desc",
              sku: "SKU1",
              category_id: "c1",
              price: 10,
              cost: 5,
              current_stock: 3,
              min_stock: 1,
              max_stock: 100,
              created_at: "2024-01-01",
              updated_at: "2024-01-02",
              categories: { name: "Cat A" },
            },
            {
              id: "p2",
              name: "Produto 2",
              description: "Desc2",
              sku: "SKU2",
              category_id: "c2",
              price: 20,
              cost: 10,
              current_stock: 5,
              min_stock: 2,
              max_stock: 200,
              created_at: "2024-01-03",
              updated_at: "2024-01-04",
              categories: { name: "Cat B" },
            },
          ]);
        }
        return buildQuery([]);
      }),
      __insertResult: insertResult,
      rpc: vi.fn(),
    },
  };
});

const mocked: any = supabase;

describe("api products service", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getProducts retorna produtos mapeados e count", async () => {
    const { data, count } = await getProducts({ page: 1, searchTerm: "" });
    expect(count).toBe(2);
    expect(data[0]).toMatchObject({
      id: "p1",
      name: "Produto 1",
      categoryId: "c1",
    });
    expect(data[0].currentStock).toBe(3);
    expect((data as any)[0].categories).toEqual({ name: "Cat A" });
  });

  it("getProducts com searchTerm chama ilike", async () => {
    const { data } = await getProducts({ page: 1, searchTerm: "Prod" });
    const queryObj = (mocked.from as any).mock.results[0].value;
    expect(queryObj.ilike).toHaveBeenCalledWith("name", "%Prod%");
    expect(data.length).toBeGreaterThan(0);
  });

  it("addProduct converte camelCase para snake_case (via repositório)", async () => {
    const insertSelectSingle = vi
      .fn()
      .mockResolvedValue({ data: mocked.__insertResult, error: null });
    const insertFn = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: insertSelectSingle }),
    });
    // Chain para findBySku pré-inserção
    const selectChain: any = {
      select: vi.fn(() => selectChain),
      eq: vi.fn(() => selectChain),
      limit: vi.fn(() => Promise.resolve({ data: [], error: null })),
    };
    mocked.from = vi.fn((table: string) => {
      if (table === "products") {
        // Se chamada de inserção, métodos de insert serão usados após verificação de SKU
        return {
          insert: insertFn,
          select: selectChain.select,
          eq: selectChain.eq,
          limit: selectChain.limit,
        } as any;
      }
      return {} as any;
    });
    const created = await addProduct({
      name: "Novo",
      description: "D",
      sku: "SKU-NEW",
      categoryId: "c1",
      price: 9,
      cost: 4,
      currentStock: 1,
      minStock: 0,
      maxStock: 10,
    });
    expect(created.categoryId).toBe("c1");
    const payload = insertFn.mock.calls[0][0];
    expect(payload).toHaveProperty("category_id", "c1");
    expect(payload).not.toHaveProperty("categoryId");
  });

  it("updateProduct envia apenas campos alterados", async () => {
    const updateSelectSingle = vi
      .fn()
      .mockResolvedValue({ data: mocked.__insertResult, error: null });
    const updateFn = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({ single: updateSelectSingle }),
      }),
    });
    mocked.from = vi.fn().mockReturnValue({ update: updateFn });
    const partial: Partial<Omit<Product, "id">> = {
      price: 12,
      currentStock: 7,
    };
    await updateProduct("p1", partial);
    const updatePayload = updateFn.mock.calls[0][0];
    expect(updatePayload).toHaveProperty("price", 12);
    expect(updatePayload).toHaveProperty("current_stock", 7);
    expect(updatePayload).not.toHaveProperty("name");
  });
});
/* Arquivo limpo: duplicações removidas */
