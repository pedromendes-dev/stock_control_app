// CLIENTES
export const getCustomers = async () => {
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name");
  if (error) handleApiError(error, "buscar clientes");
  return data;
};

// VENDAS
export const getSales = async () => {
  const { data, error } = await supabase
    .from("sales")
    .select("*, customers(name, email), sale_items(*, products(name, sku))")
    .order("created_at", { ascending: false });
  if (error) handleApiError(error, "buscar vendas");
  return data;
};

// ITENS DE VENDA
export const getSaleItems = async (saleId: string) => {
  const { data, error } = await supabase
    .from("sale_items")
    .select("*, products(name, sku)")
    .eq("sale_id", saleId);
  if (error) handleApiError(error, "buscar itens da venda");
  return data;
};
import { supabase } from "@infra/supabase/client";
// Refatoração: usar caso de uso e repositório para criação de produto
import { createProduct as createProductUseCase } from "@application/usecases/createProduct";
import { ProductSupabaseRepository } from "@infra/supabase/productSupabaseRepository";
import type { Product, Category, Supplier, StockMovement } from "@/types";
import { handleApiError } from "@/lib/utils";

// Tipos para dados com joins
export type ProductWithCategory = Product & {
  categories: { name: string } | null;
};

export type StockMovementWithProduct = StockMovement & {
  products: { name: string } | null;
};

// --- Funções de API ---

// GENÉRICO: erro agora centralizado em lib/utils.ts

// PRODUTOS
// Helpers de mapeamento snake_case -> camelCase
interface DbProductRow {
  id: string;
  name: string;
  description?: string;
  sku: string;
  category_id?: string;
  categoryId?: string;
  price?: number;
  cost?: number;
  current_stock?: number;
  currentStock?: number;
  min_stock?: number;
  minStock?: number;
  max_stock?: number;
  maxStock?: number;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  categories?: { name: string } | null;
}

const mapDbProductRow = (row: DbProductRow): Product => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  sku: row.sku,
  categoryId: row.category_id ?? row.categoryId ?? "",
  price: row.price ?? 0,
  cost: row.cost ?? 0,
  currentStock: row.current_stock ?? row.currentStock ?? 0,
  minStock: row.min_stock ?? row.minStock ?? 0,
  maxStock: row.max_stock ?? row.maxStock ?? 0,
  createdAt: row.created_at ?? row.createdAt ?? new Date().toISOString(),
  updatedAt:
    row.updated_at ??
    row.updatedAt ??
    row.created_at ??
    new Date().toISOString(),
});

export const getProducts = async ({
  page = 1,
  searchTerm = "",
  pageSize = 10,
}: {
  page?: number;
  searchTerm?: string;
  pageSize?: number;
}) => {
  const startIndex = (page - 1) * pageSize;

  let query = supabase
    .from("products")
    .select("*, categories(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(startIndex, startIndex + pageSize - 1);

  if (searchTerm) {
    query = query.ilike("name", `%${searchTerm}%`);
  }

  const { data, error, count } = await query;
  if (error) handleApiError(error, "buscar produtos");

  const mapped = (data || []).map((row: DbProductRow) => ({
    ...mapDbProductRow(row),
    categories: row.categories ?? null,
  })) as ProductWithCategory[];

  return { data: mapped, count };
};

export const addProduct = async (
  product: Omit<Product, "id" | "createdAt" | "updatedAt">
) => {
  try {
    const repo = new ProductSupabaseRepository();
    const entity = await createProductUseCase(
      { repo },
      {
        name: product.name,
        description: product.description,
        sku: product.sku,
        categoryId: product.categoryId,
        price: product.price,
        cost: product.cost,
        currentStock: product.currentStock,
        minStock: product.minStock,
        maxStock: product.maxStock,
      }
    );
    // Mapear entidade de domínio para tipo Product (UI)
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
    } as Product;
  } catch (error) {
    handleApiError(error, "adicionar produto");
    throw error;
  }
};

export const updateProduct = async (
  id: string,
  product: Partial<Omit<Product, "id">>
) => {
  const updateRow: Record<string, unknown> = {};
  if (product.name !== undefined) updateRow.name = product.name;
  if (product.description !== undefined)
    updateRow.description = product.description;
  if (product.sku !== undefined) updateRow.sku = product.sku;
  if (product.categoryId !== undefined)
    updateRow.category_id = product.categoryId;
  if (product.price !== undefined) updateRow.price = product.price;
  if (product.cost !== undefined) updateRow.cost = product.cost;
  if (product.currentStock !== undefined)
    updateRow.current_stock = product.currentStock;
  if (product.minStock !== undefined) updateRow.min_stock = product.minStock;
  if (product.maxStock !== undefined) updateRow.max_stock = product.maxStock;
  updateRow.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("products")
    .update(updateRow)
    .eq("id", id)
    .select()
    .single();
  if (error) handleApiError(error, "atualizar produto");
  return mapDbProductRow(data);
};

export const deleteProduct = async (id: string) => {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) handleApiError(error, "excluir produto");
};

export const getAllProductsSimple = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name")
    .order("name");
  if (error) handleApiError(error, "buscar lista de produtos");
  return data;
};

// CATEGORIAS
export const getCategories = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name");
  if (error) handleApiError(error, "buscar categorias");
  interface DbCategoryRow {
    id: string;
    name: string;
    description?: string;
    created_at?: string;
  }
  return (data || []).map((row: DbCategoryRow) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
  })) as Category[];
};

export const addCategory = async (
  category: Omit<Category, "id" | "createdAt">
) => {
  const { data, error } = await supabase
    .from("categories")
    .insert([category])
    .select()
    .single();
  if (error) handleApiError(error, "adicionar categoria");
  return {
    id: data.id,
    name: data.name,
    description: data.description ?? "",
    createdAt: data.created_at ?? new Date().toISOString(),
  } as Category;
};

export const updateCategory = async (
  id: string,
  category: Partial<Omit<Category, "id">>
) => {
  const { data, error } = await supabase
    .from("categories")
    .update(category)
    .eq("id", id)
    .select()
    .single();
  if (error) handleApiError(error, "atualizar categoria");
  return {
    id: data.id,
    name: data.name,
    description: data.description ?? "",
    createdAt: data.created_at ?? new Date().toISOString(),
  } as Category;
};

export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) handleApiError(error, "excluir categoria");
};

// FORNECEDORES
export const getSuppliers = async () => {
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .order("name");
  if (error) handleApiError(error, "buscar fornecedores");
  interface DbSupplierRow {
    id: string;
    name: string;
    contact?: string;
    email?: string;
    phone?: string;
    address?: string;
    created_at?: string;
  }
  return (data || []).map((row: DbSupplierRow) => ({
    id: row.id,
    name: row.name,
    contact: row.contact ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    address: row.address ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
  })) as Supplier[];
};

export const addSupplier = async (
  supplier: Omit<Supplier, "id" | "createdAt">
) => {
  const { data, error } = await supabase
    .from("suppliers")
    .insert([supplier])
    .select()
    .single();
  if (error) handleApiError(error, "adicionar fornecedor");
  return {
    id: data.id,
    name: data.name,
    contact: data.contact ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    createdAt: data.created_at ?? new Date().toISOString(),
  } as Supplier;
};

export const updateSupplier = async (
  id: string,
  supplier: Partial<Omit<Supplier, "id">>
) => {
  const { data, error } = await supabase
    .from("suppliers")
    .update(supplier)
    .eq("id", id)
    .select()
    .single();
  if (error) handleApiError(error, "atualizar fornecedor");
  return {
    id: data.id,
    name: data.name,
    contact: data.contact ?? "",
    email: data.email ?? "",
    phone: data.phone ?? "",
    address: data.address ?? "",
    createdAt: data.created_at ?? new Date().toISOString(),
  } as Supplier;
};

export const deleteSupplier = async (id: string) => {
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) handleApiError(error, "excluir fornecedor");
};

// MOVIMENTAÇÕES DE ESTOQUE
export const getStockMovements = async () => {
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*, products(name)")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) handleApiError(error, "buscar movimentações");
  return data as StockMovementWithProduct[];
};

// Versão paginada com count para React Query
export const getStockMovementsPaged = async ({
  page = 1,
  pageSize = 20,
  productId,
}: {
  page?: number;
  pageSize?: number;
  productId?: string;
}) => {
  const startIndex = (page - 1) * pageSize;
  let query = supabase
    .from("stock_movements")
    .select("*, products(name)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(startIndex, startIndex + pageSize - 1);
  if (productId) {
    query = query.eq("product_id", productId);
  }
  const { data, error, count } = await query;
  if (error) handleApiError(error, "buscar movimentações paginadas");
  return {
    data: (data as StockMovementWithProduct[]) || [],
    count: count || 0,
  };
};

export const addStockMovement = async (
  productId: string,
  type: "ENTRADA" | "SAÍDA",
  quantity: number,
  reason: string
) => {
  const result = await supabase.rpc("handle_stock_movement", {
    product_id_param: productId,
    movement_type: type,
    quantity_param: quantity,
    reason_param: reason,
  });
  const error = (result as any)?.error ?? null;
  if (error) handleApiError(error, "adicionar movimentação de estoque");
};

// DASHBOARD & RELATÓRIOS
export const getLowStockProducts = async () => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, sku, current_stock")
    .lte("current_stock", 10) // Exemplo: considera estoque baixo <= 10
    .limit(5);
  console.log("getLowStockProducts:", { data, error });
  if (error) handleApiError(error, "buscar produtos com estoque baixo");
  return data;
};

export const getDashboardData = async () => {
  const { data, error } = await supabase.rpc("get_dashboard_kpis");
  if (error) handleApiError(error, "buscar dados do dashboard");
  return data[0];
};
