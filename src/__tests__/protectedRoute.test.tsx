import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { MemoryRouter, Routes, Route } from "react-router-dom";

// Mock do hook useAuth para controlar estados
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ isAuthenticated: false, isLoading: false }),
}));

// Mock Navigate para inspecionar redirecionamento
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom"
  );
  return {
    ...actual,
    Navigate: ({ to }: { to: string }) => (
      <div data-testid="navigate" data-to={to}>
        NAVIGATE
      </div>
    ),
  };
});

describe("ProtectedRoute", () => {
  it("redireciona para /login quando não autenticado", () => {
    const { getByTestId } = render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<div>Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
    const nav = getByTestId("navigate");
    expect(nav).toHaveAttribute("data-to", "/login");
  });
});
