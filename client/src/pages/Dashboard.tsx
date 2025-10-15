import { StatCard } from "@/components/StatCard";
import { DashboardCharts } from "@/components/DashboardCharts";
import { Users, Car, MapPin, CheckCircle } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema de rastreamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Clientes"
          value="1,248"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          iconColor="text-primary"
        />
        <StatCard
          title="Veículos Ativos"
          value="892"
          icon={Car}
          trend={{ value: 8, isPositive: true }}
          iconColor="text-chart-2"
        />
        <StatCard
          title="Em Rastreamento"
          value="845"
          icon={MapPin}
          iconColor="text-chart-4"
        />
        <StatCard
          title="Instalações Hoje"
          value="23"
          icon={CheckCircle}
          trend={{ value: 5, isPositive: false }}
          iconColor="text-chart-3"
        />
      </div>

      <DashboardCharts />
    </div>
  );
}
