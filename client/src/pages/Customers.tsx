import { useState } from "react";
import { CustomerTable } from "@/components/CustomerTable";
import { CustomerFormDialog } from "@/components/CustomerFormDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ApiCustomer } from "@shared/schema";

interface CustomerWithVehicleCount extends Omit<ApiCustomer, 'address' | 'auto_debit' | 'payment_card'> {
  city: string;
  state: string;
  vehicleCount: number;
}

export default function Customers() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<ApiCustomer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  
  const { data: response, isLoading, error } = useQuery<{ customers: ApiCustomer[] | null }>({
    queryKey: ["/api/customers"],
  });
  
  const customers = response?.customers;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/customers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      toast({
        title: "Cliente deletado",
        description: "Cliente removido com sucesso!",
      });
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  const handleAdd = () => {
    setSelectedCustomer(null);
    setDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    const customer = customers?.find((c) => c.id === id);
    if (customer) {
      setSelectedCustomer(customer);
      setDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground mt-1">Gerencie os clientes cadastrados no sistema</p>
      </div>

      <CustomerTable
        customers={transformedCustomers}
        onView={(id) => console.log("View customer:", id)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      <CustomerFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customerId={selectedCustomer?.id}
        initialData={selectedCustomer}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Deletar Cliente"
        description="Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
