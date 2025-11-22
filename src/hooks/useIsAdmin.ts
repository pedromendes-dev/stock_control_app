import { useEffect, useMemo, useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getAdminRole } from "@/services/admin";

export type UseIsAdminResult = {
  loading: boolean;
  isAdmin: boolean;
  role: string | null;
  error: Error | null;
  refresh: () => Promise<void>;
};

/**
 * useIsAdmin
 * - Lê o usuário atual do AuthContext.
 * - Consulta a tabela admin_users via helpers da API para descobrir role.
 * - Expõe { isAdmin, role, loading, error } e uma função refresh().
 */
export function useIsAdmin(): UseIsAdminResult {
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState<boolean>(!authLoading);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [role, setRole] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    setError(null);
    if (!user?.id) {
      setIsAdmin(false);
      setRole(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      // você pode usar isAdminApi(user.id), mas buscamos a role explicitamente
      const r = await getAdminRole(user.id);
      setRole(r);
      setIsAdmin(!!r);
    } catch (err: unknown) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsAdmin(false);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!authLoading) {
      void load();
    }
  }, [authLoading, load]);

  const refresh = useCallback(async () => {
    await load();
  }, [load]);

  return useMemo(
    () => ({ loading, isAdmin, role, error, refresh }),
    [loading, isAdmin, role, error, refresh]
  );
}
