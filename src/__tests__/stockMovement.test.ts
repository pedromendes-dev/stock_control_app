import { describe, it, expect, vi } from "vitest";
// Mock do cliente Supabase – definir função dentro da fábrica para evitar hoisting issue
vi.mock("@infra/supabase/client", () => {
  const rpcMock = vi.fn().mockResolvedValue({ data: null, error: null });
  return { supabase: { rpc: rpcMock }, rpcMock };
});
import { addStockMovement } from "@/services/api";
import { supabase } from "@infra/supabase/client";

describe("addStockMovement", () => {
  it("executa sem lançar erro (smoke)", async () => {
    await expect(
      addStockMovement("prod-1", "ENTRADA", 5, "Reposição")
    ).resolves.toBeUndefined();
    expect((supabase as any).rpc).toHaveBeenCalledWith(
      "handle_stock_movement",
      expect.any(Object)
    );
  });
});
