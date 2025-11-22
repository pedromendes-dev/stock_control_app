import { Product } from "@core/domain/product/Product";
import { ProductRepository } from "@core/domain/product/ProductRepository";

export interface ListProductsInput {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface ListProductsOutput {
  items: Product[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function listProducts(
  deps: { repo: ProductRepository },
  input: ListProductsInput
): Promise<ListProductsOutput> {
  const pageSize = input.pageSize ?? 10;
  const page = input.page && input.page > 0 ? input.page : 1;
  const offset = (page - 1) * pageSize;

  // Usa método com contagem do repositório
  const { items, count } = await deps.repo.listWithCount({
    search: input.search,
    limit: pageSize,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  return { items, count, page, pageSize, totalPages };
}
