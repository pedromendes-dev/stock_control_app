import { useState, useEffect, useCallback } from "react";
import { listProducts } from "@application/usecases/listProducts";
import { ProductSupabaseRepository } from "@infra/supabase/productSupabaseRepository";
import type { Product } from "@/types";

interface UseProductsOptions {
  initialPageSize?: number;
}

export function useProducts(opts?: UseProductsOptions) {
  const [items, setItems] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(opts?.initialPageSize ?? 10);
  const [search, setSearch] = useState("");
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const repo = new ProductSupabaseRepository();
      const result = await listProducts({ repo }, { page, pageSize, search });
      // Mapear domínio para tipo de UI
      setItems(
        result.items.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          sku: p.sku,
          categoryId: p.categoryId,
          price: p.price,
          cost: p.cost,
          currentStock: p.currentStock,
          minStock: p.minStock,
          maxStock: p.maxStock,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }))
      );
      setCount(result.count);
      setTotalPages(result.totalPages);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const goToPage = (p: number) => setPage(p);
  const setSearchTerm = (term: string) => {
    setSearch(term);
    setPage(1);
  };
  const refresh = () => fetch();

  return {
    items,
    page,
    pageSize,
    count,
    totalPages,
    loading,
    error,
    goToPage,
    setSearchTerm,
    refresh,
    search,
  };
}
