import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ForgotPassword from "@/features/auth/pages/ForgotPassword";
import { MemoryRouter } from "react-router-dom";

// Mock supabase client (definir função dentro da fábrica para evitar hoisting)
vi.mock("@infra/supabase/client", () => {
  const resetMock = vi.fn().mockResolvedValue({ data: null, error: null });
  return {
    supabase: { auth: { resetPasswordForEmail: resetMock } },
    resetMock,
  };
});
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import { supabase } from "@infra/supabase/client";

describe("ForgotPassword", () => {
  it("envia reset quando email válido preenchido", async () => {
    render(
      <MemoryRouter>
        <ForgotPassword />
      </MemoryRouter>
    );
    const input = screen.getByLabelText(/email/i);
    await userEvent.type(input, "teste@example.com");
    const btn = screen.getByRole("button", { name: /enviar link/i });
    await userEvent.click(btn);
    expect(supabase.auth.resetPasswordForEmail as any).toHaveBeenCalledWith(
      "teste@example.com",
      {
        redirectTo: expect.stringContaining("/login"),
      }
    );
  });
});
