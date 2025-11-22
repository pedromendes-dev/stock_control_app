import { describe, it, expect, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import type { Product } from "@/types";
import { useCreateProductMutation } from "@/features/products/hooks/useProductMutations";
import { useProductsQuery } from "@/features/products/hooks/useProductsQuery";

// Store in-memory simulando backend
const store: Product[] = [];
vi.mock("@/services/api", () => ({
  getProducts: vi.fn().mockImplementation(async () => ({
    data: [...store],
    count: store.length,
  })),
  addProduct: vi.fn().mockImplementation(
    (input: Omit<Product, "id" | "createdAt" | "updatedAt">) =>
      new Promise<Product>((resolve) => {
        // resolver direto (não armazenamos separadamente)
        // Simula resposta assíncrona do servidor
        setTimeout(() => {
          const real: Product = {
            id: "real-1",
            name: input.name,
            description: input.description,
            sku: input.sku,
            categoryId: input.categoryId,
            price: input.price,
            cost: input.cost,
            currentStock: input.currentStock,
            minStock: input.minStock,
            maxStock: input.maxStock,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          store.push(real);
          resolve(real);
        }, 10);
      })
  ),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

function TestComponent() {
  const queryData = useProductsQuery({
    page: 1,
    search: "",
    pageSize: 10,
  }).data;
  const products = queryData?.products ?? [];
  const createMutation = useCreateProductMutation();
  return (
    <div>
      <button
        onClick={() =>
          createMutation.mutate({
            name: "Produto X",
            description: "Desc",
            sku: "SKU-X",
            categoryId: "cat-1",
            price: 10,
            cost: 5,
            currentStock: 0,
            minStock: 0,
            maxStock: 100,
          })
        }
      >
        create
      </button>
      <ul data-testid="products-list">
        {products.map((p) => (
          <li key={p.id}>
            {p.id}:{p.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("optimistic create product", () => {
  it("insere produto otimista antes da resolução da Promise", async () => {
    render(<TestComponent />, { wrapper: Wrapper });

    fireEvent.click(screen.getByText("create"));
    const list = screen.getByTestId("products-list");
    await waitFor(() => expect(list.textContent).toMatch(/optimistic-/));
    // Aguarda substituição pelo id real após resolução e invalidation
    await waitFor(() => expect(list.textContent).toMatch(/real-1/));
  });
});
