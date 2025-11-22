import { ProductRepository } from "@core/domain/product/ProductRepository";

export async function deleteProduct(
  deps: { repo: ProductRepository },
  id: string
): Promise<void> {
  const existing = await deps.repo.findById(id);
  if (!existing) throw new Error("Produto não encontrado");
  await deps.repo.delete(id);
}
