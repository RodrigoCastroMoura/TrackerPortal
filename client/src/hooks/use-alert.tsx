import { createContext, useContext, useState, ReactNode } from "react";
import { AlertModal } from "@/components/ui/alert-modal";

interface AlertState {
  open: boolean;
  title: string;
  description: string;
  variant: "default" | "destructive";
}

interface AlertContextType {
  alert: (options: { title: string; description: string; variant?: "default" | "destructive" }) => void;
}

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    title: "",
    description: "",
    variant: "default",
  });

  const alert = (options: {
    title: string;
    description: string;
    variant?: "default" | "destructive";
  }) => {
    setAlertState({
      open: true,
      title: options.title,
      description: options.description,
      variant: options.variant || "default",
    });
  };

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <AlertModal
        open={alertState.open}
        onOpenChange={(open) => setAlertState((prev) => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}
