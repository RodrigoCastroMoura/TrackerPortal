import { useState } from "react";
import { VehicleTable } from "@/components/VehicleTable";
import { VehicleFormDialog } from "@/components/VehicleFormDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ApiVehicle } from "@shared/schema";

interface VehicleWithCustomerName extends Omit<ApiVehicle, 'customer_id' | 'color' | 'chassis' | 'tracker_serial' | 'is_tracking'> {
  customerName: string;
  trackerSerial: string;
  isTracking: boolean;
}

export default function Vehicles() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<ApiVehicle | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  
  const { data: response, isLoading, error } = useQuery<{ vehicles: ApiVehicle[] | null }>({
    queryKey: ["/api/vehicles"],
  });
  
  const vehicles = response?.vehicles;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/vehicles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Veículo deletado",
        description: "Veículo removido com sucesso!",
      });
      setDeleteDialogOpen(false);
      setVehicleToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar veículo",
        description: error.message,
        variant: "destructive",
      });
    },
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

  const transformedVehicles: VehicleWithCustomerName[] = (vehicles && Array.isArray(vehicles)) ? vehicles.map((vehicle: any) => ({
    id: vehicle.id || "",
    plate: vehicle.dsplaca || vehicle.plate || "N/A",
    brand: vehicle.dsmarca || vehicle.brand || "N/A",
    model: vehicle.dsmodelo || vehicle.model || "N/A",
    year: vehicle.dsano || vehicle.year || "N/A",
    customerName: vehicle.customer_name || "-",
    trackerSerial: vehicle.IMEI || vehicle.tracker_serial || "-",
    status: vehicle.status || "active",
    isTracking: vehicle.is_tracking || false,
  })) : [];

  const handleAdd = () => {
    setSelectedVehicle(null);
    setDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    const vehicle = vehicles?.find((v) => v.id === id);
    if (vehicle) {
      setSelectedVehicle(vehicle);
      setDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setVehicleToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      deleteMutation.mutate(vehicleToDelete);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Veículos</h1>
        <p className="text-muted-foreground mt-1">Gerencie os veículos e rastreadores instalados</p>
      </div>

      <VehicleTable
        vehicles={transformedVehicles}
        onView={(id) => console.log("View vehicle:", id)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleLock={(id) => console.log("Toggle lock:", id)}
        onAdd={handleAdd}
      />

      <VehicleFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehicleId={selectedVehicle?.id}
        initialData={selectedVehicle}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Deletar Veículo"
        description="Tem certeza que deseja deletar este veículo? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
