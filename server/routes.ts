import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { apiClient } from "./lib/api-client";
import { loginSchema } from "@shared/schema";
import { ZodError } from "zod";

// Middleware de autenticação - apenas valida que o token existe
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  // Adiciona token na request para uso nas rotas
  (req as any).token = token;
  
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Rota de login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { identifier, password } = loginSchema.parse(req.body);

      // Faz login na API externa
      const response = await apiClient.login(identifier, password);

      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }

      const { access_token, refresh_token, user } = response.data!;

      res.json({
        token: access_token,
        refreshToken: refresh_token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          permissions: user.permissions,
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Rota de logout
  app.post("/api/auth/logout", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      
      // Faz logout na API externa
      await apiClient.logout(token);
      
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Erro ao fazer logout" });
    }
  });

  // Rota para verificar sessão - busca dados do usuário na API
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getCurrentUser(token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }

      res.json(response.data);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  });

  // ========== ROTAS DE CLIENTES ==========
  
  app.get("/api/customers", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getCustomers(req.query as any, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get customers error:", error);
      res.status(500).json({ error: "Erro ao buscar clientes" });
    }
  });

  app.get("/api/customers/search", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const { q, page = 1, per_page = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: "Parâmetro de busca (q) é obrigatório" });
      }
      
      const response = await apiClient.searchCustomers(
        q as string,
        Number(page),
        Number(per_page),
        token
      );
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Search customers error:", error);
      res.status(500).json({ error: "Erro ao buscar clientes" });
    }
  });

  app.get("/api/customers/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getCustomerStats(token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get customer stats error:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  app.get("/api/customers/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getCustomer(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get customer error:", error);
      res.status(500).json({ error: "Erro ao buscar cliente" });
    }
  });

  app.post("/api/customers", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.createCustomer(req.body, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.status(201).json(response.data);
    } catch (error) {
      console.error("Create customer error:", error);
      res.status(500).json({ error: "Erro ao criar cliente" });
    }
  });

  app.put("/api/customers/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.updateCustomer(req.params.id, req.body, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Update customer error:", error);
      res.status(500).json({ error: "Erro ao atualizar cliente" });
    }
  });

  app.delete("/api/customers/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.deleteCustomer(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data || { message: "Cliente deletado com sucesso" });
    } catch (error) {
      console.error("Delete customer error:", error);
      res.status(500).json({ error: "Erro ao deletar cliente" });
    }
  });

  // ========== ROTAS DE VEÍCULOS ==========
  
  app.get("/api/vehicles", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getVehicles(req.query as any, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get vehicles error:", error);
      res.status(500).json({ error: "Erro ao buscar veículos" });
    }
  });

  app.get("/api/vehicles/search", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const { q, page = 1, per_page = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: "Parâmetro de busca (q) é obrigatório" });
      }
      
      const response = await apiClient.searchVehicles(
        q as string,
        Number(page),
        Number(per_page),
        token
      );
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Search vehicles error:", error);
      res.status(500).json({ error: "Erro ao buscar veículos" });
    }
  });

  app.get("/api/vehicles/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getVehicle(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get vehicle error:", error);
      res.status(500).json({ error: "Erro ao buscar veículo" });
    }
  });

  app.post("/api/vehicles", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.createVehicle(req.body, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.status(201).json(response.data);
    } catch (error) {
      console.error("Create vehicle error:", error);
      res.status(500).json({ error: "Erro ao criar veículo" });
    }
  });

  app.put("/api/vehicles/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.updateVehicle(req.params.id, req.body, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Update vehicle error:", error);
      res.status(500).json({ error: "Erro ao atualizar veículo" });
    }
  });

  app.delete("/api/vehicles/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.deleteVehicle(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data || { message: "Veículo deletado com sucesso" });
    } catch (error) {
      console.error("Delete vehicle error:", error);
      res.status(500).json({ error: "Erro ao deletar veículo" });
    }
  });

  // ========== ROTAS DE RASTREAMENTO ==========
  
  app.get("/api/tracking/vehicles", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getTrackingVehicles(token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get tracking vehicles error:", error);
      res.status(500).json({ error: "Erro ao buscar veículos rastreados" });
    }
  });

  app.get("/api/tracking/vehicles/:id/location", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getVehicleLocation(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get vehicle location error:", error);
      res.status(500).json({ error: "Erro ao buscar localização do veículo" });
    }
  });

  app.get("/api/tracking/vehicles/:id/history", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const { start_date, end_date } = req.query;
      
      const response = await apiClient.getVehicleHistory(
        req.params.id,
        start_date as string,
        end_date as string,
        token
      );
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get vehicle history error:", error);
      res.status(500).json({ error: "Erro ao buscar histórico do veículo" });
    }
  });

  app.get("/api/tracking/vehicles/:id/route", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const { start_date, end_date } = req.query;
      
      const response = await apiClient.getVehicleRoute(
        req.params.id,
        start_date as string,
        end_date as string,
        token
      );
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get vehicle route error:", error);
      res.status(500).json({ error: "Erro ao buscar rota do veículo" });
    }
  });

  // ========== ROTAS DE RELATÓRIOS ==========
  
  app.get("/api/reports/vehicles/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const { start_date, end_date, type } = req.query;
      
      const response = await apiClient.getVehicleReport(
        req.params.id,
        start_date as string,
        end_date as string,
        type as string,
        token
      );
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get vehicle report error:", error);
      res.status(500).json({ error: "Erro ao gerar relatório" });
    }
  });

  // ========== ROTAS DE ESTATÍSTICAS ==========
  
  app.get("/api/stats/dashboard", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      
      // Busca dados de múltiplas fontes para montar o dashboard
      const [customersRes, vehiclesRes, trackingRes] = await Promise.all([
        apiClient.getCustomers({}, token),
        apiClient.getVehicles({}, token),
        apiClient.getTrackingVehicles(token),
      ]);
      
      // Calcula estatísticas baseadas nos dados disponíveis
      const totalCustomers = (customersRes.data as any)?.customers?.length || 0;
      const totalVehicles = (vehiclesRes.data as any)?.vehicles?.length || 0;
      const activeTracking = (trackingRes.data as any)?.vehicles?.filter((v: any) => v.status === 'active')?.length || 0;
      
      // Como não temos dados históricos, retorna dados básicos
      const stats = {
        total_customers: totalCustomers,
        total_vehicles: totalVehicles,
        active_tracking: activeTracking,
        today_installs: 0, // Sem dados históricos
        daily_registrations: [], // Sem dados históricos
        user_stats: [], // Sem dados históricos
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // ========== ROTAS DE USUÁRIOS ==========
  
  app.get("/api/users", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getUsers(req.query as any, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Erro ao buscar usuários" });
    }
  });

  app.get("/api/users/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getUser(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Erro ao buscar usuário" });
    }
  });

  app.post("/api/users", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.createUser(req.body, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.status(201).json(response.data);
    } catch (error) {
      console.error("Create user error:", error);
      res.status(500).json({ error: "Erro ao criar usuário" });
    }
  });

  app.put("/api/users/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.updateUser(req.params.id, req.body, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Update user error:", error);
      res.status(500).json({ error: "Erro ao atualizar usuário" });
    }
  });

  app.delete("/api/users/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.deleteUser(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data || { message: "Usuário deletado com sucesso" });
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  });

  // ========== ROTAS DE PERMISSÕES ==========
  
  app.get("/api/permissions/admin/:id/permissions", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getAdminPermissions(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get admin permissions error:", error);
      res.status(500).json({ error: "Erro ao buscar permissões" });
    }
  });

  app.put("/api/permissions/admin/:id/permissions", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.updateAdminPermissions(req.params.id, req.body, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Update admin permissions error:", error);
      res.status(500).json({ error: "Erro ao atualizar permissões" });
    }
  });

  app.get("/api/permissions/user/:id/permissions", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getUserPermissions(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get user permissions error:", error);
      res.status(500).json({ error: "Erro ao buscar permissões" });
    }
  });

  app.put("/api/permissions/user/:id/permissions", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.updateUserPermissions(req.params.id, req.body, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Update user permissions error:", error);
      res.status(500).json({ error: "Erro ao atualizar permissões" });
    }
  });

  // ========== TESTE DE RASTREADOR ==========
  
  app.get("/api/tracker/test", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const { imei } = req.query;
      
      if (!imei) {
        return res.status(400).json({ error: "IMEI é obrigatório" });
      }
      
      const response = await apiClient.testTracker(imei as string, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Test tracker error:", error);
      res.status(500).json({ error: "Erro ao testar rastreador" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
