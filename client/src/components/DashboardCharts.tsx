import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface DashboardChartsProps {
  dailyData?: Array<{ name: string; clientes: number; veiculos: number }>;
  userStatsData?: Array<{ name: string; cadastros: number }>;
}

export function DashboardCharts({ dailyData, userStatsData }: DashboardChartsProps) {
  const defaultDailyData = dailyData || [
    { name: "Seg", clientes: 12, veiculos: 18 },
    { name: "Ter", clientes: 15, veiculos: 22 },
    { name: "Qua", clientes: 8, veiculos: 12 },
    { name: "Qui", clientes: 20, veiculos: 28 },
    { name: "Sex", clientes: 18, veiculos: 24 },
    { name: "Sáb", clientes: 6, veiculos: 8 },
    { name: "Dom", clientes: 4, veiculos: 5 },
  ];

  const defaultUserStats = userStatsData || [
    { name: "João", cadastros: 45 },
    { name: "Maria", cadastros: 38 },
    { name: "Pedro", cadastros: 32 },
    { name: "Ana", cadastros: 28 },
    { name: "Carlos", cadastros: 25 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader className="border-b border-card-border">
          <CardTitle>Cadastros da Semana</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={defaultDailyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-muted-foreground text-xs" />
              <YAxis className="text-muted-foreground text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.375rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="clientes"
                stroke="hsl(var(--chart-1))"
                strokeWidth={2}
                name="Clientes"
              />
              <Line
                type="monotone"
                dataKey="veiculos"
                stroke="hsl(var(--chart-2))"
                strokeWidth={2}
                name="Veículos"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-card-border">
          <CardTitle>Top Técnicos (Mês)</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={defaultUserStats}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="name" className="text-muted-foreground text-xs" />
              <YAxis className="text-muted-foreground text-xs" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.375rem",
                }}
              />
              <Bar dataKey="cadastros" fill="hsl(var(--primary))" name="Cadastros" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
