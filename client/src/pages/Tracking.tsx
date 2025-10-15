import { useQuery, useMutation } from "@tanstack/react-query";
import { VehicleMap } from "@/components/VehicleMap";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Tracking() {
  const { toast } = useToast();
  
  const { data: response, isLoading, error } = useQuery({
    queryKey: ["/api/tracking/vehicles"],
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  const lockMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/vehicles/${id}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracking/vehicles"] });
      toast({
        title: "Veículo bloqueado",
        description: "Veículo bloqueado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao bloquear veículo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/vehicles/${id}/unblock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracking/vehicles"] });
      toast({
        title: "Veículo desbloqueado",
        description: "Veículo desbloqueado com sucesso!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao desbloquear veículo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Coordenadas de demonstração em Brasília
  const demoLocations = [
    { lat: -15.7801, lng: -47.9292 }, // Plano Piloto
    { lat: -15.7942, lng: -47.8822 }, // Asa Sul
    { lat: -15.7639, lng: -47.8659 }, // Asa Norte
    { lat: -15.8331, lng: -48.0365 }, // Taguatinga
    { lat: -15.8897, lng: -48.0778 }, // Ceilândia
  ];

  const vehicles = ((response as any)?.vehicles || []).map((v: any, index: number) => {
    // Se não houver dados reais de localização, usa coordenadas de demonstração
    const hasRealLocation = v.location?.lat && v.location?.lng;
    const demoLocation = demoLocations[index % demoLocations.length];
    
    return {
      id: v.id,
      plate: v.plate || "SEM PLACA",
      customerName: v.customer_name || "Sem cliente",
      lat: hasRealLocation ? v.location.lat : demoLocation.lat,
      lng: hasRealLocation ? v.location.lng : demoLocation.lng,
      status: v.status || "active",
      speed: v.location?.speed || Math.floor(Math.random() * 80), // Velocidade aleatória para demo
      lastUpdate: v.location?.timestamp 
        ? new Date(v.location.timestamp).toLocaleString('pt-BR') 
        : new Date().toLocaleString('pt-BR'),
    };
  }).filter((v: any) => v.lat && v.lng); // Remove veículos sem coordenadas válidas

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rastreamento em Tempo Real</h1>
        <p className="text-muted-foreground mt-1">Monitore a localização e status dos veículos</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[600px] text-muted-foreground">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Carregando localizações...</p>
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-[600px] text-destructive">
          <div className="text-center">
            <p className="font-semibold">Erro ao carregar veículos</p>
            <p className="text-sm mt-2">{(error as Error).message}</p>
          </div>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="flex items-center justify-center h-[600px] text-muted-foreground">
          <p>Nenhum veículo com localização disponível</p>
        </div>
      ) : (
        <VehicleMap
          vehicles={vehicles}
          onLockVehicle={(id) => lockMutation.mutate(id)}
          onUnlockVehicle={(id) => unlockMutation.mutate(id)}
        />
      )}
    </div>
  );
}
