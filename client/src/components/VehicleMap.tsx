import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Lock, Unlock, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface VehicleLocation {
  id: string;
  plate: string;
  customerName: string;
  lat: number;
  lng: number;
  status: "active" | "blocked" | "idle";
  speed: number;
  lastUpdate: string;
}

interface VehicleMapProps {
  vehicles?: VehicleLocation[];
  onLockVehicle?: (id: string) => void;
  onUnlockVehicle?: (id: string) => void;
}

export function VehicleMap({ vehicles = [], onLockVehicle, onUnlockVehicle }: VehicleMapProps) {
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | null>(null);

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
            <div className="relative h-[540px] bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Integração com mapa será implementada</p>
                <p className="text-xs mt-1">Suporte para Leaflet/Mapbox/Google Maps</p>
              </div>
              
              {/* Placeholder markers */}
              <div className="absolute inset-0 p-8">
                {vehicles.map((vehicle, index) => (
                  <div
                    key={vehicle.id}
                    className="absolute cursor-pointer hover-elevate rounded-full"
                    style={{
                      left: `${20 + index * 25}%`,
                      top: `${30 + index * 15}%`,
                    }}
                    onClick={() => setSelectedVehicle(vehicle)}
                  >
                    <div className={`relative p-2 rounded-full ${
                      vehicle.status === 'active' ? 'bg-chart-2' :
                      vehicle.status === 'blocked' ? 'bg-destructive' : 'bg-chart-3'
                    }`}>
                      <Navigation className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ))}
              </div>
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
              {vehicles.map((vehicle) => (
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
                              onUnlockVehicle?.(vehicle.id);
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
                              onLockVehicle?.(vehicle.id);
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
              ))}
            </CardContent>
          </ScrollArea>
        </Card>
      </div>
    </div>
  );
}
