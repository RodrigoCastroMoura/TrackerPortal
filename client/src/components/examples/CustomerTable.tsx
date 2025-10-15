import { CustomerTable } from "../CustomerTable";

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
];

export default function CustomerTableExample() {
  return (
    <div className="p-6 bg-background">
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
