import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { getProducts } from "@/services/api";
import type { Product } from "@/types";

export interface UseProductsQueryParams {
  page: number;
  search: string;
  pageSize?: number;
  enabled?: boolean;
}

export interface ProductsQueryData {
  products: Product[];
  count: number;
  totalPages: number;
  page: number;
  pageSize: number;
}

const DEFAULT_PAGE_SIZE = 10;

export function useProductsQuery({
  page,
  search,
  pageSize = DEFAULT_PAGE_SIZE,
  enabled = true,
}: UseProductsQueryParams): UseQueryResult<ProductsQueryData, Error> {
  return useQuery<ProductsQueryData, Error>({
    queryKey: ["products", { page, search, pageSize }],
    enabled,
    queryFn: async () => {
      const { data, count } = await getProducts({
        page,
        searchTerm: search,
        pageSize,
      });
      const totalPages = count ? Math.max(1, Math.ceil(count / pageSize)) : 1;
      return {
        products: data,
        count: count ?? 0,
        totalPages,
        page,
        pageSize,
      };
    },
    staleTime: 1000 * 30,
  });
}
