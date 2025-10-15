import { createContext, useContext, useState, ReactNode } from "react";
import { useMutation } from "@tanstack/react-query";
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
  
  // Restaura o usuário do localStorage na inicialização
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("auth_user");
    const token = localStorage.getItem("auth_token");
    if (savedUser && token) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });
  
  const isLoading = false;

  const loginMutation = useMutation({
    mutationFn: async ({ identifier, password }: { identifier: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", { identifier, password });
      return await res.json();
    },
    onSuccess: (data) => {
      // Salva o token e usuário no localStorage
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }
      if (data.user) {
        localStorage.setItem("auth_user", JSON.stringify(data.user));
        setUser(data.user);
      }
      setLocation("/");
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      // Remove o token e usuário do localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUser(null);
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
