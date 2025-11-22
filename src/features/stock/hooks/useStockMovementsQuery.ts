import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getStockMovementsPaged } from "@/services/api";
import type { StockMovement } from "@/types";

export interface UseStockMovementsParams {
  page: number;
  pageSize?: number;
  productId?: string;
}

export interface StockMovementsQueryData {
  movements: StockMovement[];
  count: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const DEFAULT_PAGE_SIZE = 20;

export function useStockMovementsQuery({
  page,
  pageSize = DEFAULT_PAGE_SIZE,
  productId,
}: UseStockMovementsParams): UseQueryResult<StockMovementsQueryData, Error> {
  return useQuery<StockMovementsQueryData, Error>({
    queryKey: ["stockMovements", { page, pageSize, productId }],
    queryFn: async () => {
      const { data, count } = await getStockMovementsPaged({
        page,
        pageSize,
        productId,
      });
      const totalPages = count ? Math.max(1, Math.ceil(count / pageSize)) : 1;
      return { movements: data, count, totalPages, page, pageSize };
    },
    staleTime: 1000 * 30,
  });
}
