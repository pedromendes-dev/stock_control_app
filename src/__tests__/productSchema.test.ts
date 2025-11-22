import { describe, it, expect } from "vitest";
import { productSchema } from "@/validation/productSchema";

describe("productSchema", () => {
  it("valida produto correto", () => {
    const parsed = productSchema.parse({
      name: "Produto ABC",
      description: "Desc",
      sku: "SKU-1234",
      categoryId: "cat-1",
      price: "10.50",
      cost: "5.00",
      currentStock: "10",
      minStock: "2",
      maxStock: "100",
    });
    expect(parsed.price).toBe(10.5);
    expect(parsed.currentStock).toBe(10);
  });

  it("falha em nome curto", () => {
    const result = productSchema.safeParse({
      name: "ab",
      description: "",
      sku: "SKU-1234",
      categoryId: "cat",
      price: "10",
      cost: "5",
      currentStock: "1",
      minStock: "0",
      maxStock: "10",
    });
    expect(result.success).toBe(false);
  });
});
