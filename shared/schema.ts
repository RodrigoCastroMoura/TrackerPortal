import { z } from "zod";

// Schema de login
export const loginSchema = z.object({
  identifier: z.string().min(1, "Identificador é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Tipos da API externa
export interface ApiUser {
  id: string;
  email: string;
  name: string;
  document?: string;
  role: string;
  status: string;
  permissions?: string[];
}

export interface ApiCustomer {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    number?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  status: "active" | "inactive";
  auto_debit?: boolean;
  payment_card?: {
    number?: string;
    holder?: string;
    expiry?: string;
  };
}

// External API vehicle response (uses Portuguese field names)
export interface ApiVehicleResponse {
  id: string;
  id_cliente?: string;
  customer_id?: string;
  dsplaca?: string;
  plate?: string;
  dsmarca?: string;
  brand?: string;
  dsmodelo?: string;
  model?: string;
  dsano?: string;
  year?: string;
  dscor?: string;
  color?: string;
  dschassi?: string;
  chassis?: string;
  IMEI?: string;
  tracker_serial?: string;
  status: "active" | "blocked" | "maintenance";
  is_tracking?: boolean;
  customer_name?: string;
}

// Normalized vehicle interface for internal use
export interface ApiVehicle {
  id: string;
  customer_id: string;
  plate: string;
  brand: string;
  model: string;
  year: string;
  color?: string;
  chassis?: string;
  tracker_serial?: string;
  status: "active" | "blocked" | "maintenance";
  is_tracking?: boolean;
}

// Helper to normalize API response to standard format
export function normalizeVehicleData(vehicle: ApiVehicleResponse): ApiVehicle {
  return {
    id: vehicle.id,
    customer_id: vehicle.customer_id || vehicle.id_cliente || "",
    plate: vehicle.dsplaca || vehicle.plate || "",
    brand: vehicle.dsmarca || vehicle.brand || "",
    model: vehicle.dsmodelo || vehicle.model || "",
    year: vehicle.dsano || vehicle.year || "",
    color: vehicle.dscor || vehicle.color,
    chassis: vehicle.dschassi || vehicle.chassis,
    tracker_serial: vehicle.IMEI || vehicle.tracker_serial,
    status: vehicle.status || "active",
    is_tracking: vehicle.is_tracking || false,
  };
}

export interface ApiStats {
  total_customers: number;
  total_vehicles: number;
  active_tracking: number;
  today_installs: number;
  daily_registrations?: Array<{ date: string; customers: number; vehicles: number }>;
  user_stats?: Array<{ user_id: string; user_name: string; registrations: number }>;
}
