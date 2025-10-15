# 🚀 Implementação de Endpoints Faltantes - Sistema de Rastreamento

## 📋 Contexto do Sistema

Este é um portal de rastreamento veicular que se comunica com uma API externa em `https://tracker-api-rodrigocastrom1.replit.app`. O sistema já possui autenticação, CRUD de clientes/veículos/usuários e interfaces visuais prontas, mas falta a integração real dos endpoints de rastreamento.

---

## 🎯 ENDPOINTS A SEREM IMPLEMENTADOS

### 1️⃣ **RASTREAMENTO EM TEMPO REAL**

#### `GET /api/tracking/vehicles`
**Descrição:** Retorna lista de todos os veículos com última localização conhecida  
**Autenticação:** Bearer Token  
**Query Params:**
- `status` (opcional): "active" | "blocked" | "idle"
- `customer_id` (opcional): filtrar por cliente
- `page` (opcional): paginação
- `per_page` (opcional): itens por página

**Response Example:**
```json
{
  "vehicles": [
    {
      "id": "v1",
      "plate": "ABC-1234",
      "customer_id": "c1",
      "customer_name": "João Silva",
      "location": {
        "lat": -23.5505,
        "lng": -46.6333,
        "address": "Av. Paulista, 1000 - São Paulo, SP",
        "speed": 45,
        "heading": 180,
        "timestamp": "2024-10-15T14:30:00Z"
      },
      "status": "active",
      "tracker_serial": "TRK001",
      "is_tracking": true
    }
  ],
  "total": 10,
  "page": 1,
  "per_page": 20
}
```

---

#### `GET /api/tracking/vehicles/:id/location`
**Descrição:** Retorna a localização atual de um veículo específico  
**Autenticação:** Bearer Token  

**Response Example:**
```json
{
  "vehicle_id": "v1",
  "plate": "ABC-1234",
  "location": {
    "lat": -23.5505,
    "lng": -46.6333,
    "address": "Av. Paulista, 1000 - São Paulo, SP",
    "speed": 45,
    "heading": 180,
    "altitude": 750,
    "accuracy": 10,
    "timestamp": "2024-10-15T14:30:00Z"
  },
  "tracker": {
    "serial": "TRK001",
    "battery": 85,
    "signal_strength": 4,
    "online": true
  }
}
```

---

#### `GET /api/tracking/vehicles/:id/history`
**Descrição:** Retorna histórico de localizações do veículo  
**Autenticação:** Bearer Token  
**Query Params:**
- `start_date` (obrigatório): data início (ISO 8601)
- `end_date` (obrigatório): data fim (ISO 8601)
- `interval` (opcional): "1min" | "5min" | "15min" | "1hour"

**Response Example:**
```json
{
  "vehicle_id": "v1",
  "plate": "ABC-1234",
  "period": {
    "start": "2024-10-15T00:00:00Z",
    "end": "2024-10-15T23:59:59Z"
  },
  "locations": [
    {
      "lat": -23.5505,
      "lng": -46.6333,
      "speed": 45,
      "heading": 180,
      "timestamp": "2024-10-15T14:30:00Z"
    }
  ],
  "total_distance": 125.5,
  "total_time_moving": 7200,
  "max_speed": 80,
  "avg_speed": 42
}
```

---

#### `GET /api/tracking/vehicles/:id/route`
**Descrição:** Retorna rota/trajeto otimizado do veículo  
**Autenticação:** Bearer Token  
**Query Params:**
- `start_date` (obrigatório): data início
- `end_date` (obrigatório): data fim

**Response Example:**
```json
{
  "vehicle_id": "v1",
  "route": {
    "points": [
      [-23.5505, -46.6333],
      [-23.5510, -46.6340],
      [-23.5515, -46.6345]
    ],
    "polyline": "encoded_polyline_string",
    "total_distance": 125.5,
    "duration": 7200,
    "stops": [
      {
        "lat": -23.5505,
        "lng": -46.6333,
        "address": "Local X",
        "arrival": "2024-10-15T10:00:00Z",
        "departure": "2024-10-15T10:15:00Z",
        "duration": 900
      }
    ]
  }
}
```

---

### 2️⃣ **TESTE DE RASTREADOR**

#### `POST /api/tracker/command`
**Descrição:** Envia comando para um rastreador  
**Autenticação:** Bearer Token  

**Request Body:**
```json
{
  "tracker_serial": "TRK001",
  "command": "GET_LOCATION",
  "params": {}
}
```

**Comandos Disponíveis:**
- `GET_LOCATION` - Solicita localização atual
- `LOCK_VEHICLE` - Bloqueia o veículo
- `UNLOCK_VEHICLE` - Desbloqueia o veículo
- `GET_STATUS` - Status do rastreador
- `GET_BATTERY` - Nível de bateria
- `TEST_CONNECTION` - Testa conectividade
- `REBOOT` - Reinicia o dispositivo

**Response Example:**
```json
{
  "command_id": "cmd123",
  "tracker_serial": "TRK001",
  "command": "GET_LOCATION",
  "status": "sent",
  "sent_at": "2024-10-15T14:30:00Z",
  "response": {
    "status": "success",
    "data": {
      "lat": -23.5505,
      "lng": -46.6333,
      "timestamp": "2024-10-15T14:30:05Z"
    },
    "received_at": "2024-10-15T14:30:05Z"
  }
}
```

---

#### `GET /api/tracker/:serial/status`
**Descrição:** Status atual do rastreador  
**Autenticação:** Bearer Token  

**Response Example:**
```json
{
  "tracker_serial": "TRK001",
  "vehicle_id": "v1",
  "vehicle_plate": "ABC-1234",
  "online": true,
  "battery": 85,
  "signal_strength": 4,
  "firmware_version": "2.4.1",
  "last_communication": "2024-10-15T14:30:00Z",
  "gps_status": "fixed",
  "gsm_status": "connected"
}
```

---

#### `GET /api/tracker/:serial/logs`
**Descrição:** Logs de comunicação do rastreador  
**Autenticação:** Bearer Token  
**Query Params:**
- `limit` (opcional): número de logs (padrão: 50)
- `type` (opcional): "command" | "response" | "error" | "all"

**Response Example:**
```json
{
  "tracker_serial": "TRK001",
  "logs": [
    {
      "id": "log1",
      "timestamp": "2024-10-15T14:30:00Z",
      "type": "command",
      "direction": "sent",
      "message": "GET_LOCATION",
      "raw_data": "AT+LOCATION?"
    },
    {
      "id": "log2",
      "timestamp": "2024-10-15T14:30:05Z",
      "type": "response",
      "direction": "received",
      "message": "Location received",
      "raw_data": "+RESP:GPS,-23.5505,-46.6333"
    }
  ]
}
```

---

### 3️⃣ **ALERTAS E NOTIFICAÇÕES**

#### `GET /api/alerts`
**Descrição:** Lista alertas configurados  
**Autenticação:** Bearer Token  

**Response Example:**
```json
{
  "alerts": [
    {
      "id": "a1",
      "type": "speed_limit",
      "vehicle_id": "v1",
      "vehicle_plate": "ABC-1234",
      "condition": {
        "max_speed": 80
      },
      "actions": ["email", "sms", "notification"],
      "active": true,
      "created_at": "2024-10-15T10:00:00Z"
    }
  ]
}
```

---

#### `POST /api/alerts`
**Descrição:** Cria novo alerta  
**Autenticação:** Bearer Token  

**Request Body:**
```json
{
  "type": "speed_limit",
  "vehicle_id": "v1",
  "condition": {
    "max_speed": 80
  },
  "actions": ["email", "notification"],
  "recipients": ["admin@example.com"]
}
```

**Tipos de Alerta:**
- `speed_limit` - Excesso de velocidade
- `geofence` - Cerca eletrônica
- `ignition` - Ignição ligada/desligada
- `low_battery` - Bateria baixa
- `offline` - Rastreador offline
- `panic_button` - Botão de pânico

---

### 4️⃣ **RELATÓRIOS**

#### `GET /api/reports/vehicles/:id`
**Descrição:** Relatório de uso do veículo  
**Autenticação:** Bearer Token  
**Query Params:**
- `start_date` (obrigatório)
- `end_date` (obrigatório)
- `type`: "summary" | "detailed" | "stops" | "trips"

**Response Example:**
```json
{
  "vehicle_id": "v1",
  "plate": "ABC-1234",
  "period": {
    "start": "2024-10-01T00:00:00Z",
    "end": "2024-10-15T23:59:59Z"
  },
  "summary": {
    "total_distance": 1250.5,
    "total_time": 86400,
    "total_trips": 45,
    "total_stops": 120,
    "avg_speed": 42,
    "max_speed": 95,
    "fuel_consumption": 125.5
  },
  "trips": [
    {
      "start": {
        "timestamp": "2024-10-15T08:00:00Z",
        "location": "Origem A"
      },
      "end": {
        "timestamp": "2024-10-15T09:30:00Z",
        "location": "Destino B"
      },
      "distance": 45.5,
      "duration": 5400,
      "avg_speed": 30
    }
  ]
}
```

---

## 🛠️ IMPLEMENTAÇÃO NO BACKEND

### Passo 1: Adicionar métodos no `api-client.ts`

```typescript
// server/lib/api-client.ts

// Rastreamento
async getVehicleLocations(params?: {
  status?: string;
  customer_id?: string;
  page?: number;
  per_page?: number;
}, token?: string) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }
  const query = queryParams.toString();
  return this.get(`/api/tracking/vehicles${query ? `?${query}` : ""}`, token);
}

async getVehicleLocation(id: string, token?: string) {
  return this.get(`/api/tracking/vehicles/${id}/location`, token);
}

async getVehicleHistory(id: string, params: {
  start_date: string;
  end_date: string;
  interval?: string;
}, token?: string) {
  const queryParams = new URLSearchParams(params as any);
  return this.get(`/api/tracking/vehicles/${id}/history?${queryParams}`, token);
}

async getVehicleRoute(id: string, params: {
  start_date: string;
  end_date: string;
}, token?: string) {
  const queryParams = new URLSearchParams(params as any);
  return this.get(`/api/tracking/vehicles/${id}/route?${queryParams}`, token);
}

// Teste de Rastreador
async sendTrackerCommand(data: {
  tracker_serial: string;
  command: string;
  params?: any;
}, token?: string) {
  return this.post("/api/tracker/command", data, token);
}

async getTrackerStatus(serial: string, token?: string) {
  return this.get(`/api/tracker/${serial}/status`, token);
}

async getTrackerLogs(serial: string, params?: {
  limit?: number;
  type?: string;
}, token?: string) {
  const queryParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, String(value));
      }
    });
  }
  const query = queryParams.toString();
  return this.get(`/api/tracker/${serial}/logs${query ? `?${query}` : ""}`, token);
}

// Alertas
async getAlerts(token?: string) {
  return this.get("/api/alerts", token);
}

async createAlert(data: any, token?: string) {
  return this.post("/api/alerts", data, token);
}

async updateAlert(id: string, data: any, token?: string) {
  return this.put(`/api/alerts/${id}`, data, token);
}

async deleteAlert(id: string, token?: string) {
  return this.delete(`/api/alerts/${id}`, token);
}

// Relatórios
async getVehicleReport(id: string, params: {
  start_date: string;
  end_date: string;
  type?: string;
}, token?: string) {
  const queryParams = new URLSearchParams(params as any);
  return this.get(`/api/reports/vehicles/${id}?${queryParams}`, token);
}
```

### Passo 2: Adicionar rotas no `routes.ts`

```typescript
// server/routes.ts

// ========== ROTAS DE RASTREAMENTO ==========

app.get("/api/tracking/vehicles", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const response = await apiClient.getVehicleLocations(req.query as any, token);
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error("Get vehicle locations error:", error);
    res.status(500).json({ error: "Erro ao buscar localizações" });
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
    res.status(500).json({ error: "Erro ao buscar localização" });
  }
});

app.get("/api/tracking/vehicles/:id/history", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const { start_date, end_date, interval } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date e end_date são obrigatórios" });
    }
    
    const response = await apiClient.getVehicleHistory(
      req.params.id,
      { start_date: start_date as string, end_date: end_date as string, interval: interval as string },
      token
    );
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error("Get vehicle history error:", error);
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

app.get("/api/tracking/vehicles/:id/route", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const { start_date, end_date } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date e end_date são obrigatórios" });
    }
    
    const response = await apiClient.getVehicleRoute(
      req.params.id,
      { start_date: start_date as string, end_date: end_date as string },
      token
    );
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error("Get vehicle route error:", error);
    res.status(500).json({ error: "Erro ao buscar rota" });
  }
});

// ========== ROTAS DE TESTE DE RASTREADOR ==========

app.post("/api/tracker/command", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const response = await apiClient.sendTrackerCommand(req.body, token);
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error("Send tracker command error:", error);
    res.status(500).json({ error: "Erro ao enviar comando" });
  }
});

app.get("/api/tracker/:serial/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const response = await apiClient.getTrackerStatus(req.params.serial, token);
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error("Get tracker status error:", error);
    res.status(500).json({ error: "Erro ao buscar status do rastreador" });
  }
});

app.get("/api/tracker/:serial/logs", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const response = await apiClient.getTrackerLogs(req.params.serial, req.query as any, token);
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error("Get tracker logs error:", error);
    res.status(500).json({ error: "Erro ao buscar logs" });
  }
});

// ========== ROTAS DE ALERTAS ==========

app.get("/api/alerts", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const response = await apiClient.getAlerts(token);
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({ error: "Erro ao buscar alertas" });
  }
});

app.post("/api/alerts", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const response = await apiClient.createAlert(req.body, token);
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.status(201).json(response.data);
  } catch (error) {
    console.error("Create alert error:", error);
    res.status(500).json({ error: "Erro ao criar alerta" });
  }
});

app.put("/api/alerts/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const response = await apiClient.updateAlert(req.params.id, req.body, token);
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.json(response.data);
  } catch (error) {
    console.error("Update alert error:", error);
    res.status(500).json({ error: "Erro ao atualizar alerta" });
  }
});

app.delete("/api/alerts/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const response = await apiClient.deleteAlert(req.params.id, token);
    
    if (response.error) {
      return res.status(response.status).json({ error: response.error });
    }
    
    res.status(204).send();
  } catch (error) {
    console.error("Delete alert error:", error);
    res.status(500).json({ error: "Erro ao deletar alerta" });
  }
});

// ========== ROTAS DE RELATÓRIOS ==========

app.get("/api/reports/vehicles/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const token = (req as any).token;
    const { start_date, end_date, type } = req.query;
    
    if (!start_date || !end_date) {
      return res.status(400).json({ error: "start_date e end_date são obrigatórios" });
    }
    
    const response = await apiClient.getVehicleReport(
      req.params.id,
      { start_date: start_date as string, end_date: end_date as string, type: type as string },
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
```

---

## 🎨 INTEGRAÇÃO NO FRONTEND

### Atualizar `Tracking.tsx`:

```typescript
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { VehicleMap } from "@/components/VehicleMap";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function Tracking() {
  const { data: response, isLoading } = useQuery({
    queryKey: ["/api/tracking/vehicles"],
    refetchInterval: 5000, // Atualiza a cada 5 segundos
  });

  const lockMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/vehicles/${id}/block`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracking/vehicles"] });
    },
  });

  const unlockMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("POST", `/api/vehicles/${id}/unblock`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tracking/vehicles"] });
    },
  });

  const vehicles = response?.vehicles || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Rastreamento em Tempo Real</h1>
        <p className="text-muted-foreground mt-1">Monitore a localização e status dos veículos</p>
      </div>

      {isLoading ? (
        <div>Carregando...</div>
      ) : (
        <VehicleMap
          vehicles={vehicles}
          onLockVehicle={(id) => lockMutation.mutate(id)}
          onUnlockVehicle={(id) => unlockMutation.mutate(id)}
        />
      )}
    </div>
  );
}
```

### Atualizar `TrackerTest.tsx`:

```typescript
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { TrackerTestPanel } from "@/components/TrackerTestPanel";
import { apiRequest } from "@/lib/queryClient";

export default function TrackerTest() {
  const [logs, setLogs] = useState<any[]>([]);

  const commandMutation = useMutation({
    mutationFn: async (data: { tracker_serial: string; command: string }) => {
      const res = await apiRequest("POST", "/api/tracker/command", data);
      return await res.json();
    },
    onSuccess: (data) => {
      setLogs(prev => [...prev, {
        timestamp: new Date().toLocaleTimeString(),
        type: "response",
        message: JSON.stringify(data),
      }]);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Teste de Rastreadores</h1>
        <p className="text-muted-foreground mt-1">Teste e valide o funcionamento dos dispositivos</p>
      </div>

      <TrackerTestPanel 
        onSendCommand={(serial, command) => commandMutation.mutate({ tracker_serial: serial, command })}
        logs={logs}
      />
    </div>
  );
}
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

- [ ] Adicionar métodos no `api-client.ts`
- [ ] Adicionar rotas no `routes.ts`
- [ ] Integrar página de Rastreamento com API real
- [ ] Integrar página de Teste de Rastreador com API real
- [ ] Adicionar funcionalidade de lock/unlock na tabela de veículos
- [ ] Testar todos os endpoints
- [ ] Adicionar tratamento de erros
- [ ] Documentar endpoints no README

---

## 🚀 PRÓXIMOS PASSOS

1. **Implementar WebSocket** para atualizações em tempo real
2. **Adicionar mapas reais** (Leaflet, Mapbox ou Google Maps)
3. **Criar sistema de notificações** push
4. **Implementar exportação de relatórios** (PDF/Excel)
5. **Adicionar analytics e dashboards** avançados
