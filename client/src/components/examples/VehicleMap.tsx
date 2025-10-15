import { VehicleMap } from "../VehicleMap";

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
];

export default function VehicleMapExample() {
  return (
    <div className="p-6 bg-background">
      <VehicleMap
        vehicles={mockVehicles}
        onLockVehicle={(id) => console.log("Lock vehicle:", id)}
        onUnlockVehicle={(id) => console.log("Unlock vehicle:", id)}
      />
    </div>
  );
}
