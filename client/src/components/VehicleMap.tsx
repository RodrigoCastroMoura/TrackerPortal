import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Lock, Unlock, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import "leaflet/dist/leaflet.css";

interface VehicleLocation {
  id: string;
  plate: string;
  customerName: string;
  lat: number;
  lng: number;
  status: "active" | "blocked" | "idle";
  speed: number;
  lastUpdate: string;
  address?: string;
}

interface VehicleMapProps {
  vehicles?: VehicleLocation[];
  onLockVehicle?: (id: string) => void;
  onUnlockVehicle?: (id: string) => void;
}

function MapUpdater({ vehicles }: { vehicles: VehicleLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (vehicles.length > 0) {
      const bounds = L.latLngBounds(
        vehicles.map(v => [v.lat, v.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [vehicles, map]);

  return null;
}

function createCustomIcon(status: "active" | "blocked" | "idle") {
  const color = 
    status === "active" ? "#00e673" :
    status === "blocked" ? "#ef4444" : "#fbbf24";
  
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg style="transform: rotate(45deg); width: 16px; height: 16px; fill: white;" viewBox="0 0 24 24">
          <path d="M12 0L15 9L24 12L15 15L12 24L9 15L0 12L9 9L12 0Z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

// Hook para buscar endereço baseado em coordenadas
function useReverseGeocode(lat: number, lng: number) {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchAddress() {
      if (!lat || !lng) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'pt-BR,pt;q=0.9',
            }
          }
        );
        const data = await response.json();
        
        if (data.display_name) {
          setAddress(data.display_name);
        } else {
          setAddress("Endereço não disponível");
        }
      } catch (error) {
        console.error("Erro ao buscar endereço:", error);
        setAddress("Erro ao carregar endereço");
      } finally {
        setLoading(false);
      }
    }

    fetchAddress();
  }, [lat, lng]);

  return { address, loading };
}

// Componente de popup customizado
function VehiclePopup({ vehicle }: { vehicle: VehicleLocation }) {
  const { address, loading } = useReverseGeocode(vehicle.lat, vehicle.lng);

  return (
    <div className="p-2 min-w-[250px]">
      <p className="font-mono font-semibold text-lg">{vehicle.plate}</p>
      <p className="text-sm text-gray-600 mb-2">{vehicle.customerName}</p>
      
      <div className="mb-3 p-2 bg-gray-50 rounded border border-gray-200">
        <div className="flex items-start gap-2">
          <MapPin className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 mb-1">Localização:</p>
            {loading ? (
              <p className="text-xs text-gray-500 italic">Carregando endereço...</p>
            ) : (
              <p className="text-xs text-gray-600 break-words">{address}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">Velocidade:</span>
        <Badge variant="outline" className="text-xs">
          {vehicle.speed} km/h
        </Badge>
      </div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">Status:</span>
        <Badge 
          variant={
            vehicle.status === "active" ? "default" :
            vehicle.status === "blocked" ? "destructive" : "secondary"
          }
          className="text-xs"
        >
          {vehicle.status === "active" ? "Ativo" :
           vehicle.status === "blocked" ? "Bloqueado" : "Parado"}
        </Badge>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Atualizado: {vehicle.lastUpdate}
      </p>
    </div>
  );
}

export function VehicleMap({ vehicles = [], onLockVehicle, onUnlockVehicle }: VehicleMapProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: 'lock' | 'unlock';
    vehicleId: string;
    vehiclePlate: string;
  }>({
    open: false,
    action: 'lock',
    vehicleId: '',
    vehiclePlate: '',
  });
  
  const defaultCenter: [number, number] = vehicles.length > 0 
    ? [vehicles[0].lat, vehicles[0].lng]
    : [-15.7939, -47.8828];

  const handleConfirmAction = () => {
    if (confirmDialog.action === 'lock') {
      onLockVehicle?.(confirmDialog.vehicleId);
    } else {
      onUnlockVehicle?.(confirmDialog.vehicleId);
    }
    setConfirmDialog({ open: false, action: 'lock', vehicleId: '', vehiclePlate: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <Card className="h-[600px]">
          <CardHeader className="border-b border-card-border">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Mapa de Rastreamento
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="relative h-[540px]">
              {vehicles.length === 0 ? (
                <div className="flex items-center justify-center h-full bg-muted">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Nenhum veículo com localização disponível</p>
                  </div>
                </div>
              ) : (
                <MapContainer
                  center={defaultCenter}
                  zoom={13}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapUpdater vehicles={vehicles} />
                  {vehicles.map((vehicle) => (
                    <Marker
                      key={vehicle.id}
                      position={[vehicle.lat, vehicle.lng]}
                      icon={createCustomIcon(vehicle.status)}
                      eventHandlers={{
                        click: () => setSelectedVehicle(vehicle),
                      }}
                    >
                      <Popup>
                        <VehiclePopup vehicle={vehicle} />
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="border-b border-card-border">
            <CardTitle className="text-base">Veículos Ativos</CardTitle>
          </CardHeader>
          <ScrollArea className="flex-1">
            <CardContent className="p-4 space-y-3">
              {vehicles.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  <p className="text-sm">Nenhum veículo disponível</p>
                </div>
              ) : (
                vehicles.map((vehicle) => (
                  <Card
                    key={vehicle.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedVehicle?.id === vehicle.id ? 'border-primary' : ''
                    }`}
                    onClick={() => setSelectedVehicle(vehicle)}
                    data-testid={`vehicle-item-${vehicle.id}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-mono font-semibold">{vehicle.plate}</p>
                          <p className="text-sm text-muted-foreground">{vehicle.customerName}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Circle
                            className={`h-2 w-2 fill-current ${
                              vehicle.status === 'active' ? 'text-chart-2' :
                              vehicle.status === 'blocked' ? 'text-destructive' : 'text-chart-3'
                            }`}
                          />
                          <Badge variant="outline" className="text-xs">
                            {vehicle.speed} km/h
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Atualizado: {vehicle.lastUpdate}
                        </p>
                        <div className="flex gap-1">
                          {vehicle.status === 'blocked' ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDialog({
                                  open: true,
                                  action: 'unlock',
                                  vehicleId: vehicle.id,
                                  vehiclePlate: vehicle.plate,
                                });
                              }}
                              data-testid={`button-unlock-${vehicle.id}`}
                            >
                              <Unlock className="h-4 w-4 text-chart-2 mr-1" />
                              Desbloquear
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDialog({
                                  open: true,
                                  action: 'lock',
                                  vehicleId: vehicle.id,
                                  vehiclePlate: vehicle.plate,
                                });
                              }}
                              data-testid={`button-lock-${vehicle.id}`}
                            >
                              <Lock className="h-4 w-4 text-destructive mr-1" />
                              Bloquear
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === 'lock' ? 'Confirmar Bloqueio' : 'Confirmar Desbloqueio'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === 'lock' 
                ? `Tem certeza que deseja BLOQUEAR o veículo ${confirmDialog.vehiclePlate}? Esta ação impedirá o funcionamento do veículo.`
                : `Tem certeza que deseja DESBLOQUEAR o veículo ${confirmDialog.vehiclePlate}? O veículo voltará a funcionar normalmente.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmAction}
              className={confirmDialog.action === 'lock' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
