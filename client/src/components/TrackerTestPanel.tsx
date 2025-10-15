import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  TestTube2,
  Send,
  Circle,
  MapPin,
  Lock,
  Unlock,
  Signal,
  Battery,
  Wifi,
} from "lucide-react";

interface LogEntry {
  timestamp: string;
  type: "command" | "response" | "error";
  message: string;
}

export function TrackerTestPanel() {
  const [command, setCommand] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      type: "response",
      message: "Sistema de teste inicializado",
    },
  ]);
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "disconnected" | "testing">("disconnected");

  const quickCommands = [
    { label: "Localização", command: "GET_LOCATION", icon: MapPin },
    { label: "Bloquear", command: "LOCK_VEHICLE", icon: Lock },
    { label: "Desbloquear", command: "UNLOCK_VEHICLE", icon: Unlock },
    { label: "Status", command: "GET_STATUS", icon: Signal },
    { label: "Bateria", command: "GET_BATTERY", icon: Battery },
    { label: "Conectividade", command: "TEST_CONNECTION", icon: Wifi },
  ];

  const handleSendCommand = () => {
    if (!command.trim()) return;

    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      type: "command",
      message: command,
    };

    setLogs((prev) => [...prev, newLog]);

    setTimeout(() => {
      const responseLog: LogEntry = {
        timestamp: new Date().toLocaleTimeString(),
        type: "response",
        message: `OK: ${command} executado com sucesso`,
      };
      setLogs((prev) => [...prev, responseLog]);
    }, 500);

    setCommand("");
  };

  const handleQuickCommand = (cmd: string) => {
    setCommand(cmd);
    setTimeout(() => handleSendCommand(), 100);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="border-b border-card-border">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TestTube2 className="h-5 w-5 text-primary" />
                Painel de Teste
              </div>
              <div className="flex items-center gap-2">
                <Circle
                  className={`h-3 w-3 fill-current ${
                    connectionStatus === "connected"
                      ? "text-chart-2"
                      : connectionStatus === "testing"
                      ? "text-chart-3"
                      : "text-muted-foreground"
                  }`}
                />
                <span className="text-sm font-normal">
                  {connectionStatus === "connected"
                    ? "Conectado"
                    : connectionStatus === "testing"
                    ? "Testando"
                    : "Desconectado"}
                </span>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o comando ou serial do rastreador..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendCommand()}
                className="font-mono"
                data-testid="input-command"
              />
              <Button
                onClick={handleSendCommand}
                data-testid="button-send-command"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {quickCommands.map((cmd) => (
                <Button
                  key={cmd.command}
                  variant="outline"
                  onClick={() => handleQuickCommand(cmd.command)}
                  className="justify-start"
                  data-testid={`button-quick-${cmd.command.toLowerCase()}`}
                >
                  <cmd.icon className="h-4 w-4 mr-2" />
                  {cmd.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="h-[400px] flex flex-col">
          <CardHeader className="border-b border-card-border">
            <CardTitle className="text-base">Log de Comandos</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-4 font-mono text-sm space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-2 rounded ${
                    log.type === "command"
                      ? "bg-primary/10 text-primary"
                      : log.type === "error"
                      ? "bg-destructive/10 text-destructive"
                      : "bg-chart-2/10 text-chart-2"
                  }`}
                  data-testid={`log-entry-${index}`}
                >
                  <span className="text-muted-foreground text-xs">[{log.timestamp}]</span>{" "}
                  <span className="uppercase text-xs font-semibold">
                    {log.type === "command" ? ">" : log.type === "error" ? "!" : "<"}
                  </span>{" "}
                  {log.message}
                </div>
              ))}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader className="border-b border-card-border">
            <CardTitle className="text-base">Informações do Rastreador</CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Serial</p>
                <p className="font-mono font-semibold">TRK-001-2024</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Modelo</p>
                <p className="font-semibold">GT06N</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Firmware</p>
                <p className="font-mono">v2.4.1</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bateria</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-chart-2" style={{ width: "85%" }} />
                  </div>
                  <span className="text-sm font-semibold">85%</span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Sinal GPS</p>
                <Badge variant="default">Forte</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Última Comunicação</p>
                <p className="text-sm">há 30 segundos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
