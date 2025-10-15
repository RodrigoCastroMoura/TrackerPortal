import { CustomerTable } from "@/components/CustomerTable";

const mockCustomers = [
  {
    id: "1",
    name: "João Silva",
    cpf: "123.456.789-00",
    email: "joao@email.com",
    phone: "(11) 98765-4321",
    city: "São Paulo",
    state: "SP",
    status: "active" as const,
    vehicleCount: 3,
  },
  {
    id: "2",
    name: "Maria Santos",
    cpf: "987.654.321-00",
    email: "maria@email.com",
    phone: "(21) 91234-5678",
    city: "Rio de Janeiro",
    state: "RJ",
    status: "active" as const,
    vehicleCount: 1,
  },
  {
    id: "3",
    name: "Pedro Costa",
    cpf: "456.789.123-00",
    email: "pedro@email.com",
    phone: "(31) 99876-5432",
    city: "Belo Horizonte",
    state: "MG",
    status: "inactive" as const,
    vehicleCount: 2,
  },
  {
    id: "4",
    name: "Ana Oliveira",
    cpf: "321.654.987-00",
    email: "ana@email.com",
    phone: "(41) 93456-7890",
    city: "Curitiba",
    state: "PR",
    status: "active" as const,
    vehicleCount: 1,
  },
];

export default function Customers() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground mt-1">Gerencie os clientes cadastrados no sistema</p>
      </div>

      <CustomerTable
        customers={mockCustomers}
        onView={(id) => console.log("View customer:", id)}
        onEdit={(id) => console.log("Edit customer:", id)}
        onDelete={(id) => console.log("Delete customer:", id)}
        onAdd={() => console.log("Add new customer")}
      />
    </div>
  );
}
