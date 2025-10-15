import { StatCard } from "../StatCard";
import { Users, Car, MapPin, CheckCircle } from "lucide-react";

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-background">
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
  );
}
