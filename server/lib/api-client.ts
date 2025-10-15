// Cliente HTTP para comunicação com a API externa de rastreamento
const API_BASE_URL = "https://tracker-api-rodrigocastrom1.replit.app";

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    token?: string
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        return {
          error: data?.message || `Erro na requisição: ${response.statusText}`,
          status: response.status,
        };
      }

      return {
        data,
        status: response.status,
      };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Erro desconhecido",
        status: 500,
      };
    }
  }

  async get<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "GET" }, token);
  }

  async post<T>(endpoint: string, body?: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }, token);
  }

  async put<T>(endpoint: string, body?: unknown, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }, token);
  }

  async delete<T>(endpoint: string, token?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: "DELETE" }, token);
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.post<{ token: string; refresh_token?: string; user: any }>(
      "/api/auth/login",
      { email, password }
    );
  }

  async logout(token?: string) {
    return this.post("/api/auth/logout", {}, token);
  }

  async refreshToken(refreshToken: string, token?: string) {
    return this.post<{ token: string }>("/api/auth/refresh", {
      refresh_token: refreshToken,
    }, token);
  }

  // Customer endpoints
  async getCustomers(params?: {
    page?: number;
    per_page?: number;
    email?: string;
    cpf?: string;
    name?: string;
    city?: string;
    state?: string;
    status?: string;
    auto_debit?: boolean;
  }, token?: string) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.get(`/api/customers${query ? `?${query}` : ""}`, token);
  }

  async getCustomer(id: string, token?: string) {
    return this.get(`/api/customers/${id}`, token);
  }

  async getCustomerByCpf(cpf: string, token?: string) {
    return this.get(`/api/customers/by-cpf/${cpf}`, token);
  }

  async searchCustomers(q: string, page = 1, per_page = 10, token?: string) {
    return this.get(`/api/customers/search?q=${encodeURIComponent(q)}&page=${page}&per_page=${per_page}`, token);
  }

  async createCustomer(data: any, token?: string) {
    return this.post("/api/customers", data, token);
  }

  async updateCustomer(id: string, data: any, token?: string) {
    return this.put(`/api/customers/${id}`, data, token);
  }

  async deleteCustomer(id: string, token?: string) {
    return this.delete(`/api/customers/${id}`, token);
  }

  async getCustomerStats(token?: string) {
    return this.get("/api/customers/stats", token);
  }

  // Vehicle endpoints
  async getVehicles(params?: {
    page?: number;
    per_page?: number;
    customer_id?: string;
    plate?: string;
    status?: string;
  }, token?: string) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.get(`/api/vehicles${query ? `?${query}` : ""}`, token);
  }

  async getVehicle(id: string, token?: string) {
    return this.get(`/api/vehicles/${id}`, token);
  }

  async createVehicle(data: any, token?: string) {
    return this.post("/api/vehicles", data, token);
  }

  async updateVehicle(id: string, data: any, token?: string) {
    return this.put(`/api/vehicles/${id}`, data, token);
  }

  async deleteVehicle(id: string, token?: string) {
    return this.delete(`/api/vehicles/${id}`, token);
  }

  async blockVehicle(id: string, token?: string) {
    return this.post(`/api/vehicles/${id}/block`, {}, token);
  }

  async unblockVehicle(id: string, token?: string) {
    return this.post(`/api/vehicles/${id}/unblock`, {}, token);
  }

  // User endpoints
  async getUsers(params?: {
    page?: number;
    per_page?: number;
    email?: string;
    document?: string;
  }, token?: string) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const query = queryParams.toString();
    return this.get(`/api/users${query ? `?${query}` : ""}`, token);
  }

  async getUser(id: string, token?: string) {
    return this.get(`/api/users/${id}`, token);
  }

  async searchUsers(q: string, page = 1, per_page = 10, token?: string) {
    return this.get(`/api/users/search?q=${encodeURIComponent(q)}&page=${page}&per_page=${per_page}`, token);
  }

  async createUser(data: any, token?: string) {
    return this.post("/api/users", data, token);
  }

  async updateUser(id: string, data: any, token?: string) {
    return this.put(`/api/users/${id}`, data, token);
  }

  async deleteUser(id: string, token?: string) {
    return this.delete(`/api/users/${id}`, token);
  }

  async toggleUserStatus(id: string, status: string, token?: string) {
    return this.post(`/api/users/${id}/status`, { status }, token);
  }

  // Permission endpoints
  async getPermissions(token?: string) {
    return this.get("/api/permissions", token);
  }

  async manageAdminPermissions(adminId: string, data: { permissions: string[]; action: "add" | "remove" }, token?: string) {
    return this.post(`/api/permissions/admin/${adminId}/permissions`, data, token);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
