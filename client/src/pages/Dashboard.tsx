import { StatCard } from "@/components/StatCard";
import { DashboardCharts } from "@/components/DashboardCharts";
import { Users, Car, MapPin, CheckCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface DashboardStats {
  total_customers: number;
  total_vehicles: number;
  active_tracking: number;
  today_installs: number;
  daily_registrations: Array<{ date: string; customers: number; vehicles: number }>;
  user_stats: Array<{ user_name: string; total_registrations: number }>;
}

export default function Dashboard() {
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/stats/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-destructive mt-1">Erro ao carregar estatísticas</p>
        </div>
      </div>
    );
  }

  const dailyData = stats?.daily_registrations?.map(item => ({
    name: new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
    clientes: item.customers,
    veiculos: item.vehicles,
  }));

  const userStatsData = stats?.user_stats?.map(item => ({
    name: item.user_name,
    cadastros: item.total_registrations,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Visão geral do sistema de rastreamento</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Clientes"
          value={stats?.total_customers.toString() || "0"}
          icon={Users}
          iconColor="text-primary"
        />
        <StatCard
          title="Veículos Ativos"
          value={stats?.total_vehicles.toString() || "0"}
          icon={Car}
          iconColor="text-chart-2"
        />
        <StatCard
          title="Em Rastreamento"
          value={stats?.active_tracking.toString() || "0"}
          icon={MapPin}
          iconColor="text-chart-4"
        />
        <StatCard
          title="Instalações Hoje"
          value={stats?.today_installs.toString() || "0"}
          icon={CheckCircle}
          iconColor="text-chart-3"
        />
      </div>

      <DashboardCharts dailyData={dailyData} userStatsData={userStatsData} />
    </div>
  );
}
