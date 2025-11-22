import { useState, useCallback } from "react";
import { deleteProduct as deleteProductUseCase } from "@application/usecases/deleteProduct";
import { ProductSupabaseRepository } from "@infra/supabase/productSupabaseRepository";

export function useDeleteProduct() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const repo = new ProductSupabaseRepository();
      await deleteProductUseCase({ repo }, id);
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro ao excluir produto";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteProduct: remove, loading, error };
}
