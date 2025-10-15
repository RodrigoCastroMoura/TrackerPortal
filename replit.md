# Vehicle Tracking Portal

## Overview

A comprehensive vehicle tracking management system built as a web application for fleet management companies. The application enables administrators and technical assistants to manage customers, vehicles, and real-time tracking of GPS-enabled devices. The system integrates with an external tracker API for authentication and data synchronization while maintaining local session management and user caching.

**Primary Purpose**: Centralized portal for managing vehicle tracking operations, customer relationships, and device testing.

**Key Features**:
- Customer and vehicle registration management
- Real-time vehicle tracking and monitoring
- GPS tracker testing and validation interface
- Role-based access control (Admin/User)
- Dark/light theme support with Material Design 3 aesthetics

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query v5 for server state management
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system

**Design System**:
- Material Design 3 adapted for enterprise fleet management
- Dark mode as primary theme (reduces eye strain for operational use)
- Custom color palette focused on data clarity and role-based visual separation
- Typography: Inter font family for optimal readability in data-dense interfaces

**Key Architectural Decisions**:
- Component-based architecture with reusable UI primitives
- Protected routes with authentication guards
- Local session persistence with query client caching
- Responsive design with mobile-first approach

### Backend Architecture

**Runtime**: Node.js with Express
- **API Pattern**: RESTful endpoints with proxy pattern to external API
- **Session Management**: PostgreSQL-backed sessions with token-based authentication
- **Database ORM**: Drizzle ORM with type-safe schema definitions
- **Build System**: Vite for development, esbuild for production bundling

**Authentication Flow**:
1. User credentials validated against external tracker API
2. Successful login receives `access_token` and `refresh_token` from external API
3. Access token stored in browser localStorage as "auth_token"
4. All API requests include `Authorization: Bearer <token>` header
5. Session persists across page reloads via localStorage
6. User data cached locally to reduce external API dependency

**Data Management Strategy**:
- Local PostgreSQL database for session storage and user caching
- External API (`tracker-api-rodrigocastrom1.replit.app`) as source of truth for business data
- Separation of concerns: authentication/sessions local, customer/vehicle/tracking data proxied

**API Client Pattern**:
- Centralized HTTP client (`server/lib/api-client.ts`) for external API communication
- Token injection middleware for authenticated requests
- Error handling and response normalization
- Support for login, customer management, vehicle management, and tracker operations

**API Data Mapping**:
- External API uses Portuguese field names that differ from internal schema
- Centralized normalization function (`normalizeVehicleData` in `shared/schema.ts`) handles mapping:
  - `dsplaca` → `plate`
  - `dsmarca` → `brand`
  - `dsmodelo` → `model`
  - `dsano` → `year`
  - `dscor` → `color`
  - `dschassi` → `chassis`
  - `IMEI` → `tracker_serial`
  - `id_cliente` → `customer_id`
- Type safety: `ApiVehicleResponse` for external API, `ApiVehicle` for normalized internal use

### Database Schema

**Local Tables** (PostgreSQL via Drizzle):

1. **sessions** - User session management
   - id (UUID, primary key)
   - userId, email, role (user identification)
   - token, refreshToken (API authentication)
   - expiresAt (session lifecycle)

2. **userCache** - Cached user data from external API
   - id (primary key)
   - email (unique)
   - name, document, role, status
   - permissions array
   - updatedAt (cache invalidation)

**Design Rationale**:
- Local session storage for fast authentication checks
- User cache reduces external API calls and improves performance
- Minimal local schema - business data remains in external system
- Session expiration prevents stale authentication

### Route Structure

**Public Routes**:
- `/login` - Authentication page

**Protected Routes** (require authentication):
- `/` - Dashboard with statistics and charts
- `/clientes` - Customer management
- `/veiculos` - Vehicle management
- `/rastreamento` - Real-time tracking map
- `/teste-rastreador` - Tracker device testing

**API Routes** (server-side):

*Authentication*:
- `POST /api/auth/login` - User authentication
- `GET /api/auth/me` - Current user session

*Customer & Vehicle Management*:
- `GET /api/customers` - Customer list (proxied)
- `POST /api/customers` - Create customer (proxied)
- `PUT /api/customers/:id` - Update customer (proxied)
- `DELETE /api/customers/:id` - Delete customer (proxied)
- `GET /api/vehicles` - Vehicle list (proxied)
- `POST /api/vehicles` - Create vehicle (proxied)
- `PUT /api/vehicles/:id` - Update vehicle (proxied)
- `DELETE /api/vehicles/:id` - Delete vehicle (proxied)

*User Management*:
- `GET /api/users` - User list (proxied)
- `POST /api/users` - Create user (proxied)
- `PUT /api/users/:id` - Update user (proxied)
- `DELETE /api/users/:id` - Delete user (proxied)

*Vehicle Tracking*:
- `GET /api/tracking/vehicles` - List all vehicles with real-time locations
- `GET /api/tracking/vehicles/:id/location` - Get current location for specific vehicle
- `GET /api/tracking/vehicles/:id/history` - Get location history (query: start_date, end_date)
- `GET /api/tracking/vehicles/:id/route` - Get traveled route (query: start_date, end_date)

*Reports*:
- `GET /api/reports/vehicles/:id` - Generate vehicle report (query: start_date, end_date, type)

*Statistics*:
- `GET /api/stats/dashboard` - Dashboard statistics (proxied)

## External Dependencies

### Third-Party Services

**External Tracker API**:
- Base URL: `https://tracker-api-rodrigocastrom1.replit.app`
- Purpose: Primary data source for customers, vehicles, and tracking data
- Authentication: JWT token-based with refresh token support
- Integration: Proxied through local Express server with session management

**Neon Database** (PostgreSQL):
- Serverless PostgreSQL with WebSocket support
- Connection pooling via `@neondatabase/serverless`
- Used for local session and cache storage
- Configured via `DATABASE_URL` environment variable

### Key NPM Packages

**Core Framework**:
- `react` + `react-dom` - UI framework
- `express` - Backend server
- `vite` - Build tool and dev server
- `typescript` - Type safety

**Database & ORM**:
- `drizzle-orm` - Type-safe ORM
- `drizzle-zod` - Schema validation
- `@neondatabase/serverless` - PostgreSQL client with WebSocket support

**UI & Components**:
- `@radix-ui/*` - Headless UI primitives (20+ components)
- `tailwindcss` - Utility-first CSS
- `class-variance-authority` - Component variant management
- `lucide-react` - Icon system

**Data Management**:
- `@tanstack/react-query` - Server state management and caching
- `react-hook-form` - Form state management
- `zod` - Runtime validation
- `@hookform/resolvers` - Form validation integration

**Routing & Navigation**:
- `wouter` - Lightweight React router
- Session-based route protection with authentication context

**Development Tools**:
- Replit-specific plugins for dev banner, cartographer, and error overlay
- `tsx` for TypeScript execution in development

### Environment Variables

**Required**:
- `DATABASE_URL` - PostgreSQL connection string for Neon database
- `NODE_ENV` - Environment mode (development/production)

### Integration Patterns

**Authentication Flow**:
1. Frontend sends credentials to `/api/auth/login`
2. Server validates against external tracker API (receives `access_token`)
3. Server stores token in PostgreSQL session table and returns to frontend
4. Frontend stores token in localStorage as "auth_token"
5. All subsequent requests include `Authorization: Bearer <token>` header
6. Server validates token and uses it for external API proxy calls
7. Session persists across reloads via localStorage token

**Data Fetching Pattern**:
- TanStack Query manages all server state
- Queries automatically retry on failure
- Session-aware error handling (401 redirects to login)
- Optimistic updates for improved UX
- Cache invalidation on mutations

**Error Handling**:
- Centralized error boundary for React errors
- API client normalizes external API errors
- Toast notifications for user-facing errors
- Development runtime error modal (Replit plugin)