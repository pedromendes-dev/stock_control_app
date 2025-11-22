import { Product } from "./Product";

export interface CreateProductDTO {
  name: string;
  description?: string;
  sku: string;
  categoryId: string;
  price: number;
  cost: number;
  currentStock: number;
  minStock: number;
  maxStock: number;
}

export interface ProductRepository {
  create(data: CreateProductDTO): Promise<Product>;
  findById(id: string): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  list(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]>;
  listWithCount(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Product[]; count: number }>;
  update(id: string, data: Partial<CreateProductDTO>): Promise<Product>;
  delete(id: string): Promise<void>;
}
