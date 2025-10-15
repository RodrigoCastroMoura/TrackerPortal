import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAlert } from "@/hooks/use-alert";
import { type ApiVehicle } from "@shared/schema";
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

const vehicleFormSchema = z.object({
  customer_id: z.string().min(1, "Cliente é obrigatório"),
  plate: z.string().min(7, "Placa deve ter pelo menos 7 caracteres"),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  year: z.string().min(4, "Ano deve ter 4 dígitos").max(4),
  color: z.string().optional(),
  chassis: z.string().optional(),
  tracker_serial: z.string().optional(),
  status: z.enum(["active", "blocked", "maintenance"]),
});

type VehicleFormData = z.infer<typeof vehicleFormSchema>;

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleId?: string;
  initialData?: ApiVehicle | null;
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  vehicleId,
  initialData,
}: VehicleFormDialogProps) {
  const { alert } = useAlert();
  const isEditing = !!vehicleId;

  // Buscar lista de clientes para o select
  const { data: customersResponse } = useQuery<{ customers: any[] | null }>({
    queryKey: ["/api/customers"],
    enabled: open,
  });

  const customers = customersResponse?.customers || [];

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      customer_id: "",
      plate: "",
      brand: "",
      model: "",
      year: "",
      color: "",
      chassis: "",
      tracker_serial: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        // initialData is already normalized ApiVehicle
        form.reset({
          customer_id: initialData.customer_id,
          plate: initialData.plate,
          brand: initialData.brand,
          model: initialData.model,
          year: initialData.year,
          color: initialData.color || "",
          chassis: initialData.chassis || "",
          tracker_serial: initialData.tracker_serial || "",
          status: initialData.status,
        });
      } else {
        form.reset({
          customer_id: "",
          plate: "",
          brand: "",
          model: "",
          year: "",
          color: "",
          chassis: "",
          tracker_serial: "",
          status: "active",
        });
      }
    }
  }, [open, initialData, form]);

  const createMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const res = await apiRequest("POST", "/api/vehicles", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      alert({
        title: "Veículo criado",
        description: "Veículo cadastrado com sucesso!",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: (error: Error) => {
      alert({
        title: "Erro ao criar veículo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: VehicleFormData) => {
      const res = await apiRequest("PUT", `/api/vehicles/${vehicleId}`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      alert({
        title: "Veículo atualizado",
        description: "Veículo atualizado com sucesso!",
      });
      onOpenChange(false);
    },
    onError: (error: Error) => {
      alert({
        title: "Erro ao atualizar veículo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: VehicleFormData) => {
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
            {isEditing ? "Editar Veículo" : "Novo Veículo"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-vehicle-customer">
                        <SelectValue placeholder="Selecione o cliente" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-plate" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tracker_serial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial do Rastreador</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-tracker" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-brand" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-model" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={4} data-testid="input-vehicle-year" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-color" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chassis"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chassi</FormLabel>
                    <FormControl>
                      <Input {...field} data-testid="input-vehicle-chassis" />
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
                        <SelectTrigger data-testid="select-vehicle-status">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="blocked">Bloqueado</SelectItem>
                        <SelectItem value="maintenance">Manutenção</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-vehicle"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-save-vehicle"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Salvando..."
                  : isEditing
                  ? "Atualizar"
                  : "Criar Veículo"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
