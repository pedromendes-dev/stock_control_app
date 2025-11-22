// Configuração de testes para Vitest + Testing Library.
// Usa a entrada específica para Vitest que estende o expect corretamente.
import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Limpeza global de DOM e restauração de mocks/spies
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
