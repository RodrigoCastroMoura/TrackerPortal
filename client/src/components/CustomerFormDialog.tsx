import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAlert } from "@/hooks/use-alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const customerFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  street: z.string().optional(),
  number: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  status: z.enum(["active", "inactive"]),
});

type CustomerFormData = z.infer<typeof customerFormSchema>;

interface CustomerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerId?: string;
  initialData?: any;
}

export function CustomerFormDialog({
  open,
  onOpenChange,
  customerId,
  initialData,
}: CustomerFormDialogProps) {
  const { alert } = useAlert();
  const isEditing = !!customerId;

  const form = useForm<CustomerFormData>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: "",
      cpf: "",
      email: "",
      phone: "",
      street: "",
      number: "",
      city: "",
      state: "",
      zip: "",
      status: "active",
    },
  });

  // Atualiza o formulário quando os dados iniciais mudam
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        cpf: initialData.cpf || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        street: initialData.address?.street || "",
        number: initialData.address?.number || "",
        city: initialData.address?.city || "",
        state: initialData.address?.state || "",
        zip: initialData.address?.zip || "",
        status: initialData.status || "active",
      });
    } else {
      form.reset({
        name: "",
        cpf: "",
        email: "",
        phone: "",
        street: "",
        number: "",
        city: "",
        state: "",
        zip: "",
        status: "active",
      });
    }
  }, [initialData, form]);

  const createMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const payload = {
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.street,
          number: data.number,
          city: data.city,
          state: data.state,
          zip: data.zip,
        },
        status: data.status,
      };
      
      const res = await apiRequest("POST", "/api/customers", payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      alert({
        title: "Cliente criado",
        description: "Cliente cadastrado com sucesso!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      alert({
        title: "Erro ao criar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: CustomerFormData) => {
      const payload = {
        name: data.name,
        cpf: data.cpf,
        email: data.email,
        phone: data.phone,
        address: {
          street: data.street,
          number: data.number,
          city: data.city,
          state: data.state,
          zip: data.zip,
        },
        status: data.status,
      };
      
      const res = await apiRequest("PUT", `/api/customers/${customerId}`, payload);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
      alert({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso!",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      alert({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CustomerFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Cliente" : "Novo Cliente"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-customer-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-customer-cpf" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} data-testid="input-customer-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-customer-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold mb-3">Endereço</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rua</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-customer-street" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-customer-number" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cidade</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-customer-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="UF" maxLength={2} data-testid="input-customer-state" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-customer-zip" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-customer-status">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-customer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-customer"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Salvando..."
                  : isEditing
                  ? "Atualizar"
                  : "Criar Cliente"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
