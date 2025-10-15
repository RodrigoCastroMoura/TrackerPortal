import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Tabela de sessões de usuário
export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(), // admin ou user
  token: text("token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Cache de dados de usuários da API
export const userCache = pgTable("user_cache", {
  id: varchar("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  document: text("document"),
  role: text("role").notNull(),
  status: text("status").notNull(),
  permissions: text("permissions").array(),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Schemas de inserção
export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
});

export const insertUserCacheSchema = createInsertSchema(userCache).omit({
  updatedAt: true,
});

// Tipos
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertUserCache = z.infer<typeof insertUserCacheSchema>;
export type UserCache = typeof userCache.$inferSelect;

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

export interface ApiStats {
  total_customers: number;
  total_vehicles: number;
  active_tracking: number;
  today_installs: number;
  daily_registrations?: Array<{ date: string; customers: number; vehicles: number }>;
  user_stats?: Array<{ user_id: string; user_name: string; registrations: number }>;
}
