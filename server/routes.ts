import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { apiClient } from "./lib/api-client";
import { loginSchema } from "@shared/schema";
import { ZodError } from "zod";

// Middleware de autenticação
async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ error: "Não autenticado" });
  }

  const session = await storage.getSessionByToken(token);
  
  if (!session) {
    return res.status(401).json({ error: "Sessão inválida ou expirada" });
  }

  // Adiciona dados da sessão na request
  (req as any).session = session;
  (req as any).userId = session.userId;
  (req as any).token = session.token;
  
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

      // Cria sessão no banco local
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 horas

      const session = await storage.createSession({
        userId: user.id,
        email: user.email,
        role: user.role,
        token: access_token,
        refreshToken: refresh_token,
        expiresAt,
      });

      // Cacheia dados do usuário
      await storage.cacheUser({
        id: user.id,
        email: user.email,
        name: user.name || user.email || identifier,
        document: user.document,
        role: user.role,
        status: user.status || "active",
        permissions: user.permissions || [],
      });

      res.json({
        token: session.token,
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
      const session = (req as any).session;
      const token = (req as any).token;
      
      // Faz logout na API externa
      await apiClient.logout(token);
      
      // Remove sessão do banco local
      await storage.deleteSession(session.id);
      
      res.json({ message: "Logout realizado com sucesso" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Erro ao fazer logout" });
    }
  });

  // Rota para verificar sessão
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const session = (req as any).session;
      const user = await storage.getCachedUser(session.userId);
      
      if (!user) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
      });
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
      
      res.status(204).send();
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
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete vehicle error:", error);
      res.status(500).json({ error: "Erro ao deletar veículo" });
    }
  });

  app.post("/api/vehicles/:id/block", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.blockVehicle(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Block vehicle error:", error);
      res.status(500).json({ error: "Erro ao bloquear veículo" });
    }
  });

  app.post("/api/vehicles/:id/unblock", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.unblockVehicle(req.params.id, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Unblock vehicle error:", error);
      res.status(500).json({ error: "Erro ao desbloquear veículo" });
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

  app.get("/api/users/search", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const { q, page = 1, per_page = 10 } = req.query;
      
      if (!q) {
        return res.status(400).json({ error: "Parâmetro de busca (q) é obrigatório" });
      }
      
      const response = await apiClient.searchUsers(
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
      console.error("Search users error:", error);
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
      
      const userData = { ...req.body };
      if (userData.document) {
        userData.cpf = userData.document;
        delete userData.document;
      }
      
      const response = await apiClient.createUser(userData, token);
      
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
      
      const userData = { ...req.body };
      if (userData.document !== undefined) {
        userData.cpf = userData.document;
        delete userData.document;
      }
      
      const response = await apiClient.updateUser(req.params.id, userData, token);
      
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
      
      res.status(204).send();
    } catch (error) {
      console.error("Delete user error:", error);
      res.status(500).json({ error: "Erro ao deletar usuário" });
    }
  });

  app.post("/api/users/:id/status", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.toggleUserStatus(req.params.id, req.body.status, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Toggle user status error:", error);
      res.status(500).json({ error: "Erro ao alterar status do usuário" });
    }
  });

  // ========== ROTAS DE ESTATÍSTICAS ==========
  
  app.get("/api/stats/dashboard", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      
      // Busca estatísticas de clientes
      const customersStats = await apiClient.getCustomerStats(token);
      
      // Busca veículos para contar ativos
      const vehiclesResponse = await apiClient.getVehicles({ page: 1, per_page: 1 }, token);
      
      const stats = {
        total_customers: (customersStats.data as any)?.total_customers || 0,
        total_vehicles: (vehiclesResponse.data as any)?.total || 0,
        active_tracking: (vehiclesResponse.data as any)?.active_count || 0,
        today_installs: (customersStats.data as any)?.today_installs || 0,
        daily_registrations: (customersStats.data as any)?.daily_registrations || [],
        user_stats: (customersStats.data as any)?.user_stats || [],
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Get dashboard stats error:", error);
      res.status(500).json({ error: "Erro ao buscar estatísticas" });
    }
  });

  // ========== ROTAS DE PERMISSÕES ==========
  
  app.get("/api/permissions", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.getPermissions(token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Get permissions error:", error);
      res.status(500).json({ error: "Erro ao buscar permissões" });
    }
  });

  app.post("/api/permissions/admin/:adminId/permissions", requireAuth, async (req: Request, res: Response) => {
    try {
      const token = (req as any).token;
      const response = await apiClient.manageAdminPermissions(req.params.adminId, req.body, token);
      
      if (response.error) {
        return res.status(response.status).json({ error: response.error });
      }
      
      res.json(response.data);
    } catch (error) {
      console.error("Manage permissions error:", error);
      res.status(500).json({ error: "Erro ao gerenciar permissões" });
    }
  });

  // Cleanup de sessões expiradas (executado periodicamente)
  setInterval(async () => {
    try {
      await storage.deleteExpiredSessions();
    } catch (error) {
      console.error("Error cleaning expired sessions:", error);
    }
  }, 60 * 60 * 1000); // A cada 1 hora

  const httpServer = createServer(app);

  return httpServer;
}
