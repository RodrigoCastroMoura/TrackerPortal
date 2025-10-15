import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, Search, Car as CarIcon, MapPin, Lock, Unlock } from "lucide-react";

interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  customerName: string;
  trackerSerial: string;
  status: "active" | "blocked" | "maintenance";
  isTracking: boolean;
}

interface VehicleTableProps {
  vehicles?: Vehicle[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onToggleLock?: (id: string) => void;
  onAdd?: () => void;
}

export function VehicleTable({
  vehicles = [],
  onView,
  onEdit,
  onDelete,
  onToggleLock,
  onAdd,
}: VehicleTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredVehicles = vehicles.filter(
    (vehicle) =>
      (vehicle.plate || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (vehicle.customerName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (vehicle.model || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, cliente ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-vehicles"
          />
        </div>
        <Button onClick={onAdd} data-testid="button-add-vehicle">
          <CarIcon className="h-4 w-4 mr-2" />
          Novo Veículo
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Placa</TableHead>
              <TableHead>Veículo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Serial Rastreador</TableHead>
              <TableHead>Rastreamento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  Nenhum veículo encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredVehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="hover-elevate">
                  <TableCell className="font-mono font-semibold">{vehicle.plate}</TableCell>
                  <TableCell>{`${vehicle.brand} ${vehicle.model} ${vehicle.year}`}</TableCell>
                  <TableCell>{vehicle.customerName}</TableCell>
                  <TableCell className="font-mono text-sm">{vehicle.trackerSerial}</TableCell>
                  <TableCell>
                    {vehicle.isTracking ? (
                      <Badge variant="default" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Offline</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        vehicle.status === "active"
                          ? "default"
                          : vehicle.status === "blocked"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {vehicle.status === "active"
                        ? "Ativo"
                        : vehicle.status === "blocked"
                        ? "Bloqueado"
                        : "Manutenção"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleLock?.(vehicle.id)}
                        data-testid={`button-lock-${vehicle.id}`}
                      >
                        {vehicle.status === "blocked" ? (
                          <Unlock className="h-4 w-4 text-chart-2" />
                        ) : (
                          <Lock className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView?.(vehicle.id)}
                        data-testid={`button-view-${vehicle.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(vehicle.id)}
                        data-testid={`button-edit-${vehicle.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete?.(vehicle.id)}
                        data-testid={`button-delete-${vehicle.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
