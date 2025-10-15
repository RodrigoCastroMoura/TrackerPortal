import { LoginForm } from "../LoginForm";

export default function LoginFormExample() {
  return <LoginForm onLogin={(email, pwd) => console.log("Login:", email, pwd)} />;
}
