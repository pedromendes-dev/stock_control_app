import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addProduct, updateProduct, deleteProduct } from "@/services/api";
import type { Product } from "@/types";
import type { ProductsQueryData } from "./useProductsQuery";

// Input types
export type CreateProductInput = Omit<
  Product,
  "id" | "createdAt" | "updatedAt"
>;
export type UpdateProductInput = { id: string } & Partial<Omit<Product, "id">>;

const PRODUCTS_KEY = ["products"];

export function useCreateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["createProduct"],
    mutationFn: async (input: CreateProductInput) => {
      const created = await addProduct(input);
      return created;
    },
    onMutate: async (input: CreateProductInput) => {
      await qc.cancelQueries({ queryKey: PRODUCTS_KEY });
      const previousQueries = qc.getQueriesData<ProductsQueryData>({
        queryKey: PRODUCTS_KEY,
      });
      // Geramos ID temporário para produto otimista
      const tempId = `optimistic-${Date.now()}`;
      const optimisticProduct: Product = {
        id: tempId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        ...input,
      } as Product;
      // Aplica somente em queries de página 1 para não quebrar paginação
      previousQueries.forEach(([key, data]) => {
        const page = (key as any)[1]?.page;
        if (page !== 1) return;
        const base: ProductsQueryData = data || {
          products: [],
          count: 0,
          totalPages: 1,
          page: 1,
          pageSize: (key as any)[1]?.pageSize ?? 10,
        };
        qc.setQueryData<ProductsQueryData>(key, {
          ...base,
          products: [optimisticProduct, ...base.products],
          count: base.count + 1,
        });
      });
      return { previousQueries, tempId };
    },
    onError: (_err, _input, ctx) => {
      // Rollback
      ctx?.previousQueries?.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data);
      });
    },
    onSuccess: (created, _input, ctx) => {
      // Substitui produto otimista pelo real
      ctx?.previousQueries?.forEach(([key]) => {
        const current = qc.getQueryData<ProductsQueryData>(key);
        if (!current) return;
        const replaced = current.products.map((p) =>
          p.id === ctx?.tempId ? created : p
        );
        qc.setQueryData<ProductsQueryData>(key, {
          ...current,
          products: replaced,
        });
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

export function useUpdateProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["updateProduct"],
    mutationFn: async (input: UpdateProductInput) => {
      const { id, ...partial } = input;
      const updated = await updateProduct(id, partial);
      return updated;
    },
    onMutate: async (input: UpdateProductInput) => {
      await qc.cancelQueries({ queryKey: PRODUCTS_KEY });
      const previousQueries = qc.getQueriesData<ProductsQueryData>({
        queryKey: PRODUCTS_KEY,
      });
      previousQueries.forEach(([key, data]) => {
        if (!data) return;
        qc.setQueryData<ProductsQueryData>(key, {
          ...data,
          products: data.products.map((p) =>
            p.id === input.id
              ? { ...p, ...input, updatedAt: new Date().toISOString() }
              : p
          ),
        });
      });
      return { previousQueries };
    },
    onError: (_err, _input, ctx) => {
      ctx?.previousQueries?.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data);
      });
    },
    onSuccess: (updated, _input, ctx) => {
      // Ajuste fino (caso servidor retorne transformação adicional)
      ctx?.previousQueries?.forEach(([key]) => {
        const current = qc.getQueryData<ProductsQueryData>(key);
        if (!current) return;
        qc.setQueryData<ProductsQueryData>(key, {
          ...current,
          products: current.products.map((p) =>
            p.id === updated.id ? updated : p
          ),
        });
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

export function useDeleteProductMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ["deleteProduct"],
    mutationFn: async (id: string) => {
      await deleteProduct(id);
      return id;
    },
    onMutate: async (id: string) => {
      await qc.cancelQueries({ queryKey: PRODUCTS_KEY });
      const previousQueries = qc.getQueriesData<ProductsQueryData>({
        queryKey: PRODUCTS_KEY,
      });
      previousQueries.forEach(([key, data]) => {
        if (!data) return;
        qc.setQueryData<ProductsQueryData>(key, {
          ...data,
          products: data.products.filter((p) => p.id !== id),
          count: Math.max(0, data.count - 1),
        });
      });
      return { previousQueries };
    },
    onError: (_err, _id, ctx) => {
      ctx?.previousQueries?.forEach(([key, data]) => {
        if (data) qc.setQueryData(key, data);
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}
