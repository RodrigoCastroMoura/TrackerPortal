import { VehicleTable } from "@/components/VehicleTable";

const mockVehicles = [
  {
    id: "1",
    plate: "ABC-1234",
    brand: "Toyota",
    model: "Corolla",
    year: "2023",
    customerName: "João Silva",
    trackerSerial: "TRK-001-2024",
    status: "active" as const,
    isTracking: true,
  },
  {
    id: "2",
    plate: "XYZ-5678",
    brand: "Honda",
    model: "Civic",
    year: "2022",
    customerName: "Maria Santos",
    trackerSerial: "TRK-002-2024",
    status: "blocked" as const,
    isTracking: false,
  },
  {
    id: "3",
    plate: "DEF-9012",
    brand: "Chevrolet",
    model: "Onix",
    year: "2024",
    customerName: "Pedro Costa",
    trackerSerial: "TRK-003-2024",
    status: "active" as const,
    isTracking: true,
  },
  {
    id: "4",
    plate: "GHI-3456",
    brand: "Volkswagen",
    model: "Gol",
    year: "2023",
    customerName: "Ana Oliveira",
    trackerSerial: "TRK-004-2024",
    status: "maintenance" as const,
    isTracking: false,
  },
];

export default function Vehicles() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Veículos</h1>
        <p className="text-muted-foreground mt-1">Gerencie os veículos e rastreadores instalados</p>
      </div>

      <VehicleTable
        vehicles={mockVehicles}
        onView={(id) => console.log("View vehicle:", id)}
        onEdit={(id) => console.log("Edit vehicle:", id)}
        onDelete={(id) => console.log("Delete vehicle:", id)}
        onToggleLock={(id) => console.log("Toggle lock:", id)}
        onAdd={() => console.log("Add new vehicle")}
      />
    </div>
  );
}
