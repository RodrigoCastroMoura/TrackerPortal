import { VehicleMap } from "@/components/VehicleMap";

const mockVehicles = [
  {
    id: "1",
    plate: "ABC-1234",
    customerName: "João Silva",
    lat: -23.5505,
    lng: -46.6333,
    status: "active" as const,
    speed: 45,
    lastUpdate: "há 2 min",
  },
  {
    id: "2",
    plate: "XYZ-5678",
    customerName: "Maria Santos",
    lat: -22.9068,
    lng: -43.1729,
    status: "blocked" as const,
    speed: 0,
    lastUpdate: "há 5 min",
  },
  {
    id: "3",
    plate: "DEF-9012",
    customerName: "Pedro Costa",
    lat: -19.9167,
    lng: -43.9345,
    status: "idle" as const,
    speed: 0,
    lastUpdate: "há 1 min",
  },
  {
    id: "4",
    plate: "GHI-3456",
    customerName: "Ana Oliveira",
    lat: -25.4284,
    lng: -49.2733,
    status: "active" as const,
    speed: 60,
    lastUpdate: "há 30 seg",
  },
];

export default function Tracking() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rastreamento em Tempo Real</h1>
        <p className="text-muted-foreground mt-1">Monitore a localização e status dos veículos</p>
      </div>

      <VehicleMap
        vehicles={mockVehicles}
        onLockVehicle={(id) => console.log("Lock vehicle:", id)}
        onUnlockVehicle={(id) => console.log("Unlock vehicle:", id)}
      />
    </div>
  );
}
