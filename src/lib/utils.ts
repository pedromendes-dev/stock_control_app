import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Centraliza tratamento de erros da API Supabase
export function handleApiError(error: unknown, context: string): never {
  const translate = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("permission denied")) {
      return "permissão negada. Verifique as políticas RLS ou privilégios do esquema.";
    }
    if (lower.includes("schema") && lower.includes("public")) {
      return "acesso negado ao esquema 'public'.";
    }
    if (lower.includes("relation") && lower.includes("does not exist")) {
      return "tabela ou view não encontrada.";
    }
    if (lower.includes("timeout")) {
      return "tempo de operação excedido.";
    }
    return msg;
  };
  if (error && typeof error === "object" && "message" in error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = (error as any).message || "erro";
    const msgPt = translate(String(raw));
    console.error(`Erro em ${context}:`, error);
    throw new Error(`Falha em ${context}: ${msgPt}`);
  }
  console.error(`Erro desconhecido em ${context}:`, error);
  throw new Error(`Falha em ${context}: erro desconhecido`);
}
