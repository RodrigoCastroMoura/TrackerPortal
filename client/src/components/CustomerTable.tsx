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
import { Eye, Edit, Trash2, Search, UserPlus } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  status: "active" | "inactive";
  vehicleCount: number;
}

interface CustomerTableProps {
  customers?: Customer[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAdd?: () => void;
}

export function CustomerTable({
  customers = [],
  onView,
  onEdit,
  onDelete,
  onAdd,
}: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCustomers = customers.filter(
    (customer) =>
      (customer.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      (customer.cpf || '').includes(searchTerm || '') ||
      (customer.email || '').toLowerCase().includes((searchTerm || '').toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-customers"
          />
        </div>
        <Button onClick={onAdd} data-testid="button-add-customer">
          <UserPlus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <div className="rounded-md border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Cidade/UF</TableHead>
              <TableHead>Veículos</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  Nenhum cliente encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id} className="hover-elevate">
                  <TableCell className="font-medium">{customer.name}</TableCell>
                  <TableCell className="font-mono text-sm">{customer.cpf}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{`${customer.city}/${customer.state}`}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{customer.vehicleCount}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "active" ? "default" : "secondary"}>
                      {customer.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onView?.(customer.id)}
                        data-testid={`button-view-${customer.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit?.(customer.id)}
                        data-testid={`button-edit-${customer.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete?.(customer.id)}
                        data-testid={`button-delete-${customer.id}`}
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
