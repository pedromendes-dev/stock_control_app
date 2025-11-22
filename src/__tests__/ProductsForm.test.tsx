import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Products from "@/pages/Products";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Mock API calls usados para lista e categorias (usado por hook react-query)
vi.mock("@/services/api", () => ({
  getProducts: vi.fn().mockResolvedValue({ data: [], count: 0 }),
  getCategories: vi.fn().mockResolvedValue([]),
  addProduct: vi.fn().mockResolvedValue({
    id: "new",
    name: "Produto Teste",
    description: "Desc",
    sku: "SKU-1234",
    categoryId: "cat1",
    price: 10,
    cost: 5,
    currentStock: 1,
    minStock: 0,
    maxStock: 10,
    createdAt: "",
    updatedAt: "",
  }),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

// Mock hook de listagem com React Query
vi.mock("@/features/products/hooks/useProductsQuery", () => ({
  useProductsQuery: () => ({
    data: {
      products: [],
      count: 0,
      totalPages: 1,
      page: 1,
      pageSize: 10,
    },
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  }),
}));
// Mock mutations
vi.mock("@/features/products/hooks/useProductMutations", () => ({
  useCreateProductMutation: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ id: "new" }),
    isPending: false,
  }),
  useUpdateProductMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useDeleteProductMutation: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

describe("Products page form", () => {
  it("exibe mensagens de validação ao tentar salvar vazio", async () => {
    const qc = new QueryClient();
    render(
      <QueryClientProvider client={qc}>
        <Products />
      </QueryClientProvider>
    );
    const saveButton = screen.getByRole("button", {
      name: /adicionar produto/i,
    });
    await userEvent.click(saveButton);
    // Abre o dialog
    const dialogSave = await screen.findByRole("button", {
      name: /salvar produto/i,
    });
    await userEvent.click(dialogSave);
    // Mensagens esperadas (nome obrigatório, categoria obrigatória etc.)
    const nameError = await screen.findByText(
      /O nome deve ter pelo menos 3 caracteres/i
    );
    expect(nameError).toBeInTheDocument();
  });
});
