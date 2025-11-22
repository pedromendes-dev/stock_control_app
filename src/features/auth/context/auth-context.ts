import { createContext } from "react";
import type { User } from "@supabase/supabase-js";

export interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  socialLogin: (provider: "google" | "github" | string) => Promise<void>;
  logout: () => Promise<void>;
  renewSession: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
