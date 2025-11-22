import { supabase } from "@infra/supabase/client";
import { Product } from "@core/domain/product/Product";
import {
  ProductRepository,
  CreateProductDTO,
} from "@core/domain/product/ProductRepository";

interface ProductRow {
  id: string;
  name: string;
  description: string | null;
  sku: string;
  category_id: string;
  price: number; // numeric vem como number no client
  cost: number;
  current_stock: number;
  min_stock: number;
  max_stock: number;
  created_at: string;
  updated_at: string;
}

function mapRowToEntity(row: ProductRow): Product {
  return new Product({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    sku: row.sku,
    categoryId: row.category_id,
    price: Number(row.price),
    cost: Number(row.cost),
    currentStock: row.current_stock,
    minStock: row.min_stock,
    maxStock: row.max_stock,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  });
}

export class ProductSupabaseRepository implements ProductRepository {
  async create(data: CreateProductDTO): Promise<Product> {
    const { data: inserted, error } = await supabase
      .from("products")
      .insert({
        name: data.name,
        description: data.description ?? "",
        sku: data.sku,
        category_id: data.categoryId,
        price: data.price,
        cost: data.cost,
        current_stock: data.currentStock,
        min_stock: data.minStock,
        max_stock: data.maxStock,
      })
      .select()
      .single();
    if (error) throw error;
    return mapRowToEntity(inserted as ProductRow);
  }

  async findById(id: string): Promise<Product | null> {
    const { data: row, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();
    if (error && error.code !== "PGRST116") throw error; // not found
    return row ? mapRowToEntity(row as ProductRow) : null;
  }

  async findBySku(sku: string): Promise<Product | null> {
    const { data: rows, error } = await supabase
      .from("products")
      .select("*")
      .eq("sku", sku)
      .limit(1);
    if (error) throw error;
    if (!rows || rows.length === 0) return null;
    return mapRowToEntity(rows[0] as ProductRow);
  }

  async list(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<Product[]> {
    let query = supabase.from("products").select("*");
    if (params?.search) {
      query = query.ilike("name", `%${params.search}%`);
    }
    if (params?.limit) query = query.limit(params.limit);
    if (params?.offset)
      query = query.range(
        params.offset,
        params.offset + (params.limit || 50) - 1
      );

    const { data: rows, error } = await query;
    if (error) throw error;
    return (rows as ProductRow[]).map(mapRowToEntity);
  }

  async listWithCount(params?: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ items: Product[]; count: number }> {
    const limit = params?.limit ?? 10;
    const offset = params?.offset ?? 0;
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });
    if (params?.search) {
      query = query.ilike("name", `%${params.search}%`);
    }
    const { data: rows, error, count } = await query;
    if (error) throw error;
    return {
      items: (rows as ProductRow[]).map(mapRowToEntity),
      count: count || 0,
    };
  }

  async update(id: string, data: Partial<CreateProductDTO>): Promise<Product> {
    const payload: Record<string, unknown> = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.description !== undefined) payload.description = data.description;
    if (data.sku !== undefined) payload.sku = data.sku;
    if (data.categoryId !== undefined) payload.category_id = data.categoryId;
    if (data.price !== undefined) payload.price = data.price;
    if (data.cost !== undefined) payload.cost = data.cost;
    if (data.currentStock !== undefined)
      payload.current_stock = data.currentStock;
    if (data.minStock !== undefined) payload.min_stock = data.minStock;
    if (data.maxStock !== undefined) payload.max_stock = data.maxStock;

    const { data: updated, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return mapRowToEntity(updated as ProductRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  }
}
