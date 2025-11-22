import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/api";
import type { Category } from "@/types";

// Mapeia resultado bruto (caso venha snake_case) para Category
function mapRow(row: any): Category {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    createdAt: row.created_at ?? new Date().toISOString(),
  };
}

export function useCategoriesQuery(enabled: boolean = true) {
  return useQuery<{ categories: Category[] }>({
    queryKey: ["categories"],
    enabled,
    queryFn: async () => {
      const raw = await getCategories();
      const categories = Array.isArray(raw) ? raw.map(mapRow) : [];
      return { categories };
    },
    staleTime: 1000 * 60, // 1 minuto
  });
}
