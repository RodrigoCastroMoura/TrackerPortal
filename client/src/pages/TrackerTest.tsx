import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { VehicleMap } from "@/components/VehicleMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

export default function TrackerTest() {
  const [vehicleId, setVehicleId] = useState("");
  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  // Busca localização do veículo selecionado
  const { data: locationData, isLoading } = useQuery({
    queryKey: ["/api/tracking/vehicles", selectedVehicleId, "location"],
    queryFn: async () => {
      if (!selectedVehicleId) return null;
      const res = await fetch(`/api/tracking/vehicles/${selectedVehicleId}/location`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
      });
      
      if (!res.ok) {
        throw new Error("Veículo não encontrado");
      }
      
      return res.json();
    },
    enabled: !!selectedVehicleId,
    refetchInterval: 3000, // Atualiza a cada 3 segundos
  });

  const handleSearch = () => {
    if (vehicleId.trim()) {
      setSelectedVehicleId(vehicleId.trim());
    }
  };

  const vehicle = locationData ? {
    id: locationData.vehicle_id,
    plate: locationData.plate,
    customerName: "Teste de Rastreador",
    lat: locationData.location?.lat || 0,
    lng: locationData.location?.lng || 0,
    status: "active" as const,
    speed: locationData.location?.speed || 0,
    lastUpdate: locationData.location?.timestamp 
      ? new Date(locationData.location.timestamp).toLocaleString('pt-BR') 
      : 'Sem dados',
  } : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teste de Rastreador</h1>
        <p className="text-muted-foreground mt-1">Visualize a localização em tempo real de um veículo</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Buscar Veículo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Digite o ID do veículo"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              data-testid="input-search-vehicle"
            />
            <Button 
              onClick={handleSearch} 
              data-testid="button-search-vehicle"
              disabled={!vehicleId.trim()}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center h-[600px] text-muted-foreground">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando localização...</p>
          </div>
        </div>
      )}

      {vehicle && !isLoading && (
        <VehicleMap
          vehicles={[vehicle]}
          onLockVehicle={() => {}}
          onUnlockVehicle={() => {}}
        />
      )}

      {!vehicle && selectedVehicleId && !isLoading && (
        <div className="flex items-center justify-center h-[600px] text-muted-foreground">
          <p>Nenhum veículo encontrado com este ID</p>
        </div>
      )}
    </div>
  );
}
