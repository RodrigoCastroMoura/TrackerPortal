import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [lastKnownUser, setLastKnownUser] = useState<User | null>(null);
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const token = localStorage.getItem("auth_token");
      const headers: Record<string, string> = {};
      
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      
      const res = await fetch("/api/auth/me", {
        headers,
        credentials: "include",
      });
      
      if (res.status === 401) {
        return null;
      }
      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }
      return await res.json();
    },
    retry: 1,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000,
  });

  // Atualiza o último usuário conhecido quando os dados mudam com sucesso
  useEffect(() => {
    if (user !== undefined && !error) {
      setLastKnownUser(user);
    }
  }, [user, error]);

  const loginMutation = useMutation({
    mutationFn: async ({ identifier, password }: { identifier: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { identifier, password });
      return await res.json();
    },
    onSuccess: (data) => {
      // Salva o token no localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      queryClient.setQueryData(["/api/auth/me"], data.user);
      setLocation("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      // Remove o token do localStorage
      localStorage.removeItem("auth_token");
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
      setLocation("/login");
    },
  });

  const login = async (identifier: string, password: string) => {
    await loginMutation.mutateAsync({ identifier, password });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  // Usa o último usuário conhecido se houver erro (mas não 401)
  const currentUser = error && user === undefined ? lastKnownUser : user ?? null;

  return (
    <AuthContext.Provider value={{ user: currentUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
