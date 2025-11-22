import { useState, useCallback } from "react";
import { createProduct as createProductUseCase } from "@application/usecases/createProduct";
import { ProductSupabaseRepository } from "@infra/supabase/productSupabaseRepository";
import type { Product } from "@/types";

interface CreateInput {
  name: string;
  description: string;
  sku: string;
  categoryId: string;
  price: number;
  cost: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
}

export function useCreateProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(
    async (input: CreateInput): Promise<Product | null> => {
      setLoading(true);
      setError(null);
      try {
        const repo = new ProductSupabaseRepository();
        const entity = await createProductUseCase({ repo }, input);
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
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Erro ao criar produto";
        setError(msg);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { createProduct: create, loading, error };
}
