import { supabase } from "@infra/supabase/client";
import { handleApiError } from "@/lib/utils";

/**
 * Busca o papel (role) de administrador de um usuário
 * @param userId - ID do usuário
 * @returns O papel do administrador ou null se não for admin
 */
export const getAdminRole = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from("admin_users")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    handleApiError(error, "buscar papel de administrador");
  }

  return (data as { role?: string } | null)?.role ?? null;
};

/**
 * Verifica se um usuário é administrador
 * @param userId - ID do usuário
 * @returns Objeto com informações se é admin e qual o papel
 */
export const isAdmin = async (
  userId: string
): Promise<{ isAdmin: boolean; role: string | null }> => {
  const role = await getAdminRole(userId);
  return { isAdmin: !!role, role };
};
