import { useState, useCallback } from "react";
import { updateProduct as updateProductUseCase } from "@application/usecases/updateProduct";
import { ProductSupabaseRepository } from "@infra/supabase/productSupabaseRepository";
import type { Product } from "@/types";

interface UpdateInput {
  id: string;
  name?: string;
  description?: string;
  sku?: string;
  categoryId?: string;
  price?: number;
  cost?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
}

export function useUpdateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    async (input: UpdateInput): Promise<Product | null> => {
      setLoading(true);
      setError(null);
      try {
        const repo = new ProductSupabaseRepository();
        const entity = await updateProductUseCase({ repo }, input);
        return {
          id: entity.id,
          name: entity.name,
          description: entity.description,
          sku: entity.sku,
          categoryId: entity.categoryId,
          price: entity.price,
          cost: entity.cost,
          currentStock: entity.currentStock,
          minStock: entity.minStock,
          maxStock: entity.maxStock,
          // createdAt não pertence ao agregado retornado pelo caso de uso; usamos timestamp atual como fallback
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Erro ao atualizar produto";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { updateProduct: update, loading, error };
}
