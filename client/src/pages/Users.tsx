import { useState } from "react";
import { UserTable } from "@/components/UserTable";
import { UserFormDialog } from "@/components/UserFormDialog";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { ApiUser } from "@shared/schema";

export default function Users() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  
  const { data: response, isLoading, error } = useQuery<{ users: ApiUser[] | null }>({
    queryKey: ["/api/users"],
  });
  
  const users = response?.users;

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Usuário deletado",
        description: "Usuário removido com sucesso!",
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao deletar usuário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Usuários</h1>
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
            <h1 className="text-3xl font-bold">Usuários</h1>
            <p className="text-destructive mt-1">Erro ao carregar dados</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAdd = () => {
    setSelectedUser(null);
    setDialogOpen(true);
  };

  const handleEdit = (id: string) => {
    const user = users?.find((u) => u.id === id);
    if (user) {
      setSelectedUser(user);
      setDialogOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    setUserToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Usuários</h1>
        <p className="text-muted-foreground mt-1">Gerencie os usuários do sistema</p>
      </div>

      <UserTable
        users={users || []}
        onView={(id) => console.log("View user:", id)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={selectedUser?.id}
        initialData={selectedUser}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Deletar Usuário"
        description="Tem certeza que deseja deletar este usuário? Esta ação não pode ser desfeita."
        onConfirm={confirmDelete}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
