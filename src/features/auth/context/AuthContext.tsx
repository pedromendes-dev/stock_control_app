import { useState, useEffect, ReactNode, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@infra/supabase/client";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { AuthContext } from "./auth-context";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const idleTimeoutMinutes =
    Number(import.meta.env.VITE_IDLE_TIMEOUT_MINUTES) || 30;
  const idleTimer = useRef<number | null>(null);
  const activityEventsRef = useRef<string[]>([
    "mousemove",
    "mousedown",
    "keydown",
    "touchstart",
    "scroll",
  ]);

  useEffect(() => {
    const getSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error("Erro ao buscar sessão:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      if (_event === "SIGNED_OUT") {
        navigate("/login");
      }
      if (_event === "SIGNED_IN") {
        navigate("/dashboard");
      }
    });

    // Desconecta o usuário após período de inatividade
    const resetIdleTimer = () => {
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
      }
      idleTimer.current = window.setTimeout(() => {
        toast("Você foi desconectado por inatividade.");
        supabase.auth.signOut().catch(() => {});
      }, idleTimeoutMinutes * 60 * 1000);
    };

    // Monitora atividade do usuário
    const events = activityEventsRef.current;
    events.forEach((ev) => window.addEventListener(ev, resetIdleTimer));
    resetIdleTimer();

    return () => {
      subscription.unsubscribe();
      // Remove os listeners ao desmontar o componente
      events.forEach((ev) => window.removeEventListener(ev, resetIdleTimer));
      if (idleTimer.current) {
        window.clearTimeout(idleTimer.current);
      }
    };
  }, [navigate, idleTimeoutMinutes]);

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }

    // Se o login retornou uma sessão, atualiza o estado e redireciona
    if (data?.session) {
      setUser(data.session.user ?? null);
      setIsAuthenticated(true);
      try {
        navigate("/dashboard");
      } catch {
        // Ignora erros de navegação em contextos sem router
      }
    }
  };

  const register = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw error;
    }

    // Se o registro retornou uma sessão, atualiza o estado e redireciona
    if (data?.session) {
      setUser(data.session.user ?? null);
      setIsAuthenticated(true);
      try {
        navigate("/dashboard");
      } catch {
        // Ignora erros de navegação em contextos sem router
      }
    } else {
      // Se precisa confirmar email, mostra mensagem
      toast.success("Conta criada! Verifique seu email para confirmar.", {
        description: "Após confirmar, você poderá fazer login.",
      });
    }
  };

  const socialLogin = async (provider: "google" | "github" | string) => {
    // Configura o redirecionamento para voltar à aplicação após o OAuth
    const redirectTo =
      typeof window !== "undefined" ? window.location.origin : undefined;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as "google" | "github",
      options: { redirectTo },
    });
    if (error) {
      console.error("Erro no login social:", error);
      throw error;
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Erro ao fazer logout:", error);
    }

    // Limpa o estado local e redireciona para o login
    setUser(null);
    setIsAuthenticated(false);
    try {
      navigate("/login");
    } catch {
      // Ignora erros de navegação
    }
  };

  const renewSession = async () => {
    // Busca a sessão atual e atualiza o estado
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      if (session) {
        setUser(session.user ?? null);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Erro ao renovar sessão:", err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        user,
        login,
        register,
        socialLogin,
        logout,
        renewSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
