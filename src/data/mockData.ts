// Arquivo esvaziado: mocks removidos para evitar números fictícios em produção.
import type { Product } from "@/types";
import { THEMES, type ThemeKey, resolveThemeKey } from "./themes";

export { resolveThemeKey };

export type SimpleCategory = { id: string; name: string };

export function getMockCategories(theme: ThemeKey): SimpleCategory[] {
  const cats = THEMES[theme].categories;
  return cats.map((name, idx) => ({ id: String(idx + 1), name }));
}

// Retorna lista vazia; pode ser substituído por seed controlado via SQL/Supabase.
export function getMockProducts(
  _theme: ThemeKey,
  _count: number,
  _categories: SimpleCategory[]
): Product[] {
  return [];
}
