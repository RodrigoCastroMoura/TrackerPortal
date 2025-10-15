import { VehicleTable } from "@/components/VehicleTable";
import { useQuery } from "@tanstack/react-query";
import type { ApiVehicle } from "@shared/schema";

interface VehicleWithCustomerName extends Omit<ApiVehicle, 'customer_id' | 'color' | 'chassis' | 'tracker_serial' | 'is_tracking'> {
  customerName: string;
  trackerSerial: string;
  isTracking: boolean;
}

export default function Vehicles() {
  const { data: vehicles, isLoading, error } = useQuery<ApiVehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Veículos</h1>
          <p className="text-muted-foreground mt-1">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Veículos</h1>
            <p className="text-destructive mt-1">Erro ao carregar dados</p>
          </div>
        </div>
      </div>
    );
  }

  const transformedVehicles: VehicleWithCustomerName[] = vehicles?.map(vehicle => ({
    id: vehicle.id,
    plate: vehicle.plate,
    brand: vehicle.brand,
    model: vehicle.model,
    year: vehicle.year,
    customerName: "-",
    trackerSerial: vehicle.tracker_serial || "-",
    status: vehicle.status,
    isTracking: vehicle.is_tracking || false,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Veículos</h1>
        <p className="text-muted-foreground mt-1">Gerencie os veículos e rastreadores instalados</p>
      </div>

      <VehicleTable
        vehicles={transformedVehicles}
        onView={(id) => console.log("View vehicle:", id)}
        onEdit={(id) => console.log("Edit vehicle:", id)}
        onDelete={(id) => console.log("Delete vehicle:", id)}
        onToggleLock={(id) => console.log("Toggle lock:", id)}
        onAdd={() => console.log("Add new vehicle")}
      />
    </div>
  );
}
