import { z } from "zod";
import { Product } from "@core/domain/product/Product";
import { ProductRepository } from "@core/domain/product/ProductRepository";

const updateProductInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  sku: z.string().min(4).optional(),
  categoryId: z.string().min(1).optional(),
  price: z.number().positive().optional(),
  cost: z.number().positive().optional(),
  currentStock: z.number().int().nonnegative().optional(),
  minStock: z.number().int().nonnegative().optional(),
  maxStock: z.number().int().nonnegative().optional(),
});

export type UpdateProductInput = z.input<typeof updateProductInputSchema>;

export async function updateProduct(
  deps: { repo: ProductRepository },
  input: UpdateProductInput
): Promise<Product> {
  const parsed = updateProductInputSchema.parse(input);
  const existing = await deps.repo.findById(parsed.id);
  if (!existing) throw new Error("Produto não encontrado");

  // Se min/max fornecidos, valida relação
  const min = parsed.minStock ?? existing.minStock;
  const max = parsed.maxStock ?? existing.maxStock;
  if (min > max) throw new Error("minStock não pode ser maior que maxStock");

  // Se sku alterado, garantir unicidade
  if (parsed.sku && parsed.sku !== existing.sku) {
    const skuTaken = await deps.repo.findBySku(parsed.sku);
    if (skuTaken) throw new Error("SKU já cadastrado");
  }

  return deps.repo.update(parsed.id, {
    name: parsed.name,
    description: parsed.description,
    sku: parsed.sku,
    categoryId: parsed.categoryId,
    price: parsed.price,
    cost: parsed.cost,
    currentStock: parsed.currentStock,
    minStock: parsed.minStock,
    maxStock: parsed.maxStock,
  });
}
