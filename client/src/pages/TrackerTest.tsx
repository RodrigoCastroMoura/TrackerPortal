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
  const { data: locationData, isLoading, error } = useQuery({
    queryKey: selectedVehicleId ? [`/api/tracking/vehicles/${selectedVehicleId}/location`] : [],
    enabled: !!selectedVehicleId,
    refetchInterval: 3000, // Atualiza a cada 3 segundos
  });

  const handleSearch = () => {
    if (vehicleId.trim()) {
      setSelectedVehicleId(vehicleId.trim());
    }
  };

  const vehicle = (locationData as any) ? {
    id: (locationData as any).vehicle_id,
    plate: (locationData as any).plate,
    customerName: "Teste de Rastreador",
    lat: (locationData as any).location?.lat || 0,
    lng: (locationData as any).location?.lng || 0,
    status: "active" as const,
    speed: (locationData as any).location?.speed || 0,
    lastUpdate: (locationData as any).location?.timestamp 
      ? new Date((locationData as any).location.timestamp).toLocaleString('pt-BR') 
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

      {error && (
        <div className="flex items-center justify-center h-[600px] text-destructive">
          <div className="text-center">
            <p className="font-semibold">Erro ao carregar localização</p>
            <p className="text-sm mt-2">{(error as Error).message}</p>
          </div>
        </div>
      )}

      {!vehicle && !error && selectedVehicleId && !isLoading && (
        <div className="flex items-center justify-center h-[600px] text-muted-foreground">
          <p>Nenhum veículo encontrado com este ID</p>
        </div>
      )}
    </div>
  );
}
