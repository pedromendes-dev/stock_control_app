import { describe, it, expect } from "vitest";
import { createProduct } from "@application/usecases/createProduct";
import { Product } from "@core/domain/product/Product";
import {
  ProductRepository,
  CreateProductDTO,
} from "@core/domain/product/ProductRepository";

class InMemoryProductRepository implements ProductRepository {
  private items: Product[] = [];
  async create(data: CreateProductDTO): Promise<Product> {
    const product = new Product({
      id: crypto.randomUUID(),
      description: data.description ?? "",
      ...data,
    });
    this.items.push(product);
    return product;
  }
  async findById(id: string): Promise<Product | null> {
    return this.items.find((p) => p.id === id) || null;
  }
  async findBySku(sku: string): Promise<Product | null> {
    return this.items.find((p) => p.sku === sku) || null;
  }
  async list(): Promise<Product[]> {
    return [...this.items];
  }
  async listWithCount(): Promise<{ items: Product[]; count: number }> {
    return { items: [...this.items], count: this.items.length };
  }
  async update(id: string, data: Partial<CreateProductDTO>): Promise<Product> {
    const idx = this.items.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("not found");
    const current = this.items[idx];
    const updated = new Product({
      id: current.id,
      name: data.name ?? current.name,
      description: data.description ?? current.description,
      sku: data.sku ?? current.sku,
      categoryId: data.categoryId ?? current.categoryId,
      price: data.price ?? current.price,
      cost: data.cost ?? current.cost,
      currentStock: data.currentStock ?? current.currentStock,
      minStock: data.minStock ?? current.minStock,
      maxStock: data.maxStock ?? current.maxStock,
    });
    this.items[idx] = updated;
    return updated;
  }
  async delete(id: string): Promise<void> {
    this.items = this.items.filter((p) => p.id !== id);
  }
}

describe("createProduct use case", () => {
  it("cria produto válido", async () => {
    const repo = new InMemoryProductRepository();
    const input = {
      name: "Produto Teste",
      description: "Desc",
      sku: "SKU1234",
      categoryId: "cat-1",
      price: 10,
      cost: 5,
      currentStock: 0,
      minStock: 0,
      maxStock: 100,
    };
    const result = await createProduct({ repo }, input);
    expect(result).toBeInstanceOf(Product);
    expect(result.sku).toBe("SKU1234");
  });

  it("falha se SKU duplicado", async () => {
    const repo = new InMemoryProductRepository();
    const base = {
      name: "Produto Teste",
      description: "Desc",
      sku: "SKU1234",
      categoryId: "cat-1",
      price: 10,
      cost: 5,
      currentStock: 0,
      minStock: 0,
      maxStock: 100,
    };
    await createProduct({ repo }, base);
    await expect(createProduct({ repo }, base)).rejects.toThrow(
      /SKU já cadastrado/
    );
  });

  it("falha se minStock > maxStock", async () => {
    const repo = new InMemoryProductRepository();
    await expect(
      createProduct(
        { repo },
        {
          name: "Produto",
          description: "Desc",
          sku: "SKU1235",
          categoryId: "cat-1",
          price: 10,
          cost: 5,
          currentStock: 0,
          minStock: 10,
          maxStock: 5,
        }
      )
    ).rejects.toThrow(/minStock não pode ser maior que maxStock/);
  });
});
