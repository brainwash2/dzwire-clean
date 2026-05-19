"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface AuthUser {
  id: string;
  username: string | null;
  name: string | null;
  profileImage: string | null;
  hasActiveSubscription: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (returnTo?: string) => void;
  logout: () => void;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refetch: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetch = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/user", { credentials: "include" });
      const data = await res.json();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refetch().finally(() => setIsLoading(false));
  }, [refetch]);

  const login = (returnTo?: string) => {
    const target = returnTo ?? (typeof window !== "undefined" ? window.location.pathname : "/fr");
    window.location.href = `/api/login?returnTo=${encodeURIComponent(target)}`;
  };

  const logout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
