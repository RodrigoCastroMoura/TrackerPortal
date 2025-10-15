import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/lib/auth";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  const handleLogin = async (identifier: string, password: string) => {
    try {
      setLoginError(null);
      await login(identifier, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao fazer login";
      setLoginError(errorMessage);
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return <LoginForm onLogin={handleLogin} />;
}
