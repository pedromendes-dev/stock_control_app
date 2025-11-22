import { z } from "zod";
import { Product } from "@core/domain/product/Product";
import { ProductRepository } from "@core/domain/product/ProductRepository";

// Schema de validação de entrada (pode reaproveitar futuramente schema existente)
const createProductInputSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  sku: z.string().min(4),
  categoryId: z.string().min(1),
  price: z.number().positive(),
  cost: z.number().positive(),
  currentStock: z.number().int().nonnegative(),
  minStock: z.number().int().nonnegative(),
  maxStock: z.number().int().nonnegative(),
});

export type CreateProductInput = z.input<typeof createProductInputSchema>;

export async function createProduct(
  deps: { repo: ProductRepository },
  input: CreateProductInput
): Promise<Product> {
  const parsed = createProductInputSchema.parse(input);
  // Regra: minStock <= maxStock
  if (parsed.minStock > parsed.maxStock) {
    throw new Error("minStock não pode ser maior que maxStock");
  }
  // Poderíamos verificar SKU único via repo
  const existing = await deps.repo.findBySku(parsed.sku);
  if (existing) {
    throw new Error("SKU já cadastrado");
  }
  return deps.repo.create({ ...parsed });
}
