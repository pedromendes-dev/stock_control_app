import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addStockMovement } from "@/services/api";
import type { StockMovement, Product } from "@/types";

interface CreateStockMovementInput {
  productId: string;
  type: "ENTRADA" | "SAÍDA";
  quantity: number;
  reason: string;
}

interface StockMovementsQueryData {
  movements: StockMovement[];
  count: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

interface ProductsQueryData {
  products: Product[];
  count: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const STOCK_KEY = ["stockMovements"]; // raiz para invalidação
const PRODUCTS_KEY = ["products"]; // raiz produtos

export function useCreateStockMovementMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateStockMovementInput) => {
      await addStockMovement(
        input.productId,
        input.type,
        input.quantity,
        input.reason
      );
      return input; // retorno mínimo (server não retorna a linha diretamente)
    },
    onMutate: async (input) => {
      // Cancelar operações em andamento relacionadas
      await qc.cancelQueries({ queryKey: STOCK_KEY });
      await qc.cancelQueries({ queryKey: PRODUCTS_KEY });

      // Snapshot
      const previousStockQueries = qc.getQueriesData<StockMovementsQueryData>({
        queryKey: STOCK_KEY,
      });
      const previousProductsQueries = qc.getQueriesData<ProductsQueryData>({
        queryKey: PRODUCTS_KEY,
      });

      const optimisticId = `optimistic-${Date.now()}`;
      const optimisticMovement: StockMovement = {
        id: optimisticId,
        productId: input.productId,
        productName: "(atualizando...)", // será substituído após refetch
        type: input.type,
        quantity: input.quantity,
        reason: input.reason,
        createdAt: new Date().toISOString(),
      };

      // Inserir movimento temporário somente em páginas cuja page === 1
      previousStockQueries.forEach(([key, data]) => {
        if (!data) return;
        if (data.page !== 1) return;
        qc.setQueryData<StockMovementsQueryData>(key, {
          ...data,
          movements: [optimisticMovement, ...data.movements],
          count: data.count + 1,
        });
      });

      // Ajustar estoque atual do produto em todas as páginas de produtos
      previousProductsQueries.forEach(([key, data]) => {
        if (!data) return;
        const updated = data.products.map((p) => {
          if (p.id !== input.productId) return p;
          const delta =
            input.type === "ENTRADA" ? input.quantity : -input.quantity;
          return { ...p, currentStock: Math.max(0, p.currentStock + delta) };
        });
        qc.setQueryData<ProductsQueryData>(key, { ...data, products: updated });
      });

      return { previousStockQueries, previousProductsQueries, optimisticId };
    },
    onError: (_err, _input, ctx) => {
      // Restaurar snapshots em caso de erro
      ctx?.previousStockQueries?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
      ctx?.previousProductsQueries?.forEach(([key, data]) => {
        qc.setQueryData(key, data);
      });
    },
    onSettled: () => {
      // Recarregar dados reais (obter nome correto do produto e novo estoque confirmado)
      qc.invalidateQueries({ queryKey: STOCK_KEY });
      qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}
