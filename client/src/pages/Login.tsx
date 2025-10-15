import { LoginForm } from "@/components/LoginForm";
import { useLocation } from "wouter";

export default function Login() {
  const [, setLocation] = useLocation();

  const handleLogin = (email: string, password: string) => {
    console.log("Login attempt:", { email, password });
    // TODO: Implement actual login logic
    setLocation("/");
  };

  return <LoginForm onLogin={handleLogin} />;
}
