import { CustomerTable } from "@/components/CustomerTable";
import { useQuery } from "@tanstack/react-query";
import type { ApiCustomer } from "@shared/schema";

interface CustomerWithVehicleCount extends Omit<ApiCustomer, 'address' | 'auto_debit' | 'payment_card'> {
  city: string;
  state: string;
  vehicleCount: number;
}

export default function Customers() {
  const { data: response, isLoading, error } = useQuery<{ customers: ApiCustomer[] | null }>({
    queryKey: ["/api/customers"],
  });
  
  const customers = response?.customers;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground mt-1">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Clientes</h1>
            <p className="text-destructive mt-1">Erro ao carregar dados</p>
          </div>
        </div>
      </div>
    );
  }

  const transformedCustomers: CustomerWithVehicleCount[] = customers?.map(customer => ({
    id: customer.id,
    name: customer.name,
    cpf: customer.cpf,
    email: customer.email,
    phone: customer.phone,
    city: customer.address?.city || "-",
    state: customer.address?.state || "-",
    status: customer.status,
    vehicleCount: 0,
  })) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground mt-1">Gerencie os clientes cadastrados no sistema</p>
      </div>

      <CustomerTable
        customers={transformedCustomers}
        onView={(id) => console.log("View customer:", id)}
        onEdit={(id) => console.log("Edit customer:", id)}
        onDelete={(id) => console.log("Delete customer:", id)}
        onAdd={() => console.log("Add new customer")}
      />
    </div>
  );
}
