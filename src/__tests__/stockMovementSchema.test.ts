import { describe, it, expect } from "vitest";
import { stockMovementSchema } from "@/validation/stockMovementSchema";

describe("stockMovementSchema", () => {
  it("valida movimentação de entrada", () => {
    const parsed = stockMovementSchema.parse({
      productId: "prod-1",
      quantity: "5",
      reason: "Compra fornecedor",
    });
    expect(parsed.quantity).toBe(5);
  });

  it("falha em quantidade zero", () => {
    const result = stockMovementSchema.safeParse({
      productId: "p2",
      quantity: "0",
      reason: "Teste",
    });
    expect(result.success).toBe(false);
  });
});
