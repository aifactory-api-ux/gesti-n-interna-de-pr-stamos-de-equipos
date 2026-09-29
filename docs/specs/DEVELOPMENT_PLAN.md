# DEVELOPMENT PLAN: Gestión interna de préstamos de equipos

## 1. ARCHITECTURE OVERVIEW

Este proyecto implementa una aplicación web interna para la gestión de préstamos de equipos en Apiux. La arquitectura sigue un patrón monolítico modular con NestJS en backend y React en frontend, conectados mediante una API REST.

```
prestamo-equipos-apiux/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── entities/      # TypeORM entities
│   │   ├── enums/        # Status enums
│   │   ├── modules/       # Feature modules (auth, equipment, loan, collaborator, audit-log, manager, health)
│   │   ├── common/        # Decorators, filters, interceptors, utils
│   │   └── config/        # Database & Azure configs
│   └── Dockerfile
├── frontend/             # React SPA
│   ├── src/
│   │   ├── api/          # API client
│   │   ├── components/   # UI components
│   │   ├── contexts/     # Auth context
│   │   ├── hooks/        # useEquipment, useLoan, useManager
│   │   ├── pages/        # Login, Catalog, ManagerPanel
│   │   └── styles/       # Design tokens
│   └── Dockerfile
├── docker-compose.yml
└── .env.example
```

**Entidades principales:** Collaborator, Equipment, Loan, AuditLog  
**Flujos de usuario:** Login Azure AD → Catálogo Equipos → Solicitud Préstamo → Aprobación Manager → Devolución

## 2. ACCEPTANCE CRITERIA

1. **Autenticación Azure AD:** Usuarios del dominio api-ux.com pueden iniciar sesión mediante OAuth 2.0 con Azure AD y obtener token JWT válido.
2. **Catálogo de equipos:** Colaboradores pueden visualizar equipos con filtros por tipo, estado y búsqueda, viendo disponibilidad en tiempo real.
3. **Solicitud de préstamo:** Colaborador puede solicitar préstamo de equipo disponible; solicitud queda pendiente de aprobación.
4. **Flujo de aprobación:** Manager puede aprobar/rechazar solicitudes pendientes; al aprobar, estado del equipo cambia a "loaned".
5. **Registro de devolución:** Manager registra devolución; equipo vuelve a estado "available", loan.status = "returned".
6. **Panel de gestión:** Manager visualiza estadísticas, lista de préstamos pendientes/vencidos, historial de auditoría.
7. **Auditoría completa:** Cada acción (crear, aprobar, rechazar, devolver) genera registro en audit_log con usuario y timestamp.
8. **Despliegue Docker:** `./run.sh` levanta todos los servicios; aplicación accesible en http://localhost:25173.

## 3. EXECUTABLE ITEMS

### ITEM 1: Foundation — shared types, enums, entities, design tokens, DB schema

**Goal:** Crear toda la base compartida que usan backend y frontend: entidades TypeORM, enums, interfaces TypeScript, tokens de diseño y schema SQL. Esta es la única fuente de verdad para modelos y tipos.

**Files to create:**

*Backend — Types & Enums:*
- `backend/src/enums/index.ts` (create) - EquipmentStatus, EquipmentType, LoanStatus, ApprovalStatus, AuditAction
- `backend/src/types/index.ts` (create) - interfaces AuthUser, PaginationResult<T>, ManagerStats

*Backend — Entities (TypeORM):*
- `backend/src/entities/collaborator.entity.ts` (create) - Entidad collaborator con azure_ad_id, name, email
- `backend/src/entities/equipment.entity.ts` (create) - Entidad equipment con name, type, status, serial_number
- `backend/src/entities/loan.entity.ts` (create) - Entidad loan con foreign keys, loan_date, due_date, return_date, status, approval_status
- `backend/src/entities/audit-log.entity.ts` (create) - Entidad audit_log con action, entity_type, entity_id, timestamp, details

*Backend — Common Utils:*
- `backend/src/common/utils/uuid.ts` (create) - generateUUID() utility

*Frontend — Types & Tokens:*
- `frontend/src/types/index.ts` (create) - Todos los interfaces: Collaborator, Equipment, Loan, AuditLog, CreateLoanRequest, etc.
- `frontend/src/styles/tokens.ts` (create) - Design tokens exactos del contrato UI/UX (colors, typography, spacing, shadows, etc.)

*Database Schema:*
- `backend/src/db/schema.sql` (create) - Schema SQL completo con CREATE TABLE, índices y comentarios

*Shared Config:*
- `backend/src/config/database.config.ts` (create) - TypeORM config con variables de entorno
- `backend/src/config/azure.config.ts` (create) - Azure AD config helper

**Dependencies:** Ninguna  
**Validation:** `cd backend && npm install && npx tsc --noEmit` y `cd frontend && npm install && npx tsc --noEmit` completan sin errores de tipos  
**Role:** role-tl (technical_lead)

---

### ITEM 2: Backend — Auth Module (Azure AD integration)

**Goal:** Implementar módulo de autenticación con Azure AD: login OAuth 2.0, callback handler, validación de tokens, endpoint /auth/me, logout. Incluye strategy MSAL y guard para protección de rutas.

**Files to create:**

*Auth Module:*
- `backend/src/modules/auth/auth.module.ts` (create) - Module con AuthController, AuthService, AzureStrategy
- `backend/src/modules/auth/auth.controller.ts` (create) - Endpoints: GET /auth/azure/login, GET /auth/azure/callback, GET /auth/me, POST /auth/logout
- `backend/src/modules/auth/auth.service.ts` (create) - Lógica de auth: validateToken, getUserProfile, createSession, validateSession
- `backend/src/modules/auth/azure.strategy.ts` (create) - Passport Azure AD strategy con MSAL
- `backend/src/modules/auth/auth.guard.ts` (create) - Custom guard que valida JWT y extrae usuario

*Auth DTOs:*
- `backend/src/modules/auth/dto/auth-callback.dto.ts` (create) - DTO para callback params

*Common Decorators:*
- `backend/src/common/decorators/current-user.decorator.ts` (create) - @CurrentUser() decorator
- `backend/src/common/decorators/roles.decorator.ts` (create) - @Roles() decorator para RBAC

*Common Filters:*
- `backend/src/common/filters/http-exception.filter.ts` (create) - Filtro global de excepciones

**Dependencies:** Item 1  
**Validation:** `curl http://localhost:23000/api/health` retorna `{status: "ok"}` después de levantar el contenedor  
**Role:** role-be (backend_developer)

---

### ITEM 3: Backend — Equipment & Loan Modules

**Goal:** Implementar módulos de equipamiento y préstamos: CRUD de equipos con filtros/paginación, tipos de equipos, ciclo de vida de préstamos (crear, aprobar, rechazar, devolver, cancelar). Incluye detección de vencidos (overdue).

**Files to create:**

*Equipment Module:*
- `backend/src/modules/equipment/equipment.module.ts` (create) - Module con EquipmentController, EquipmentService
- `backend/src/modules/equipment/equipment.controller.ts` (create) - Endpoints: GET /equipment, GET /equipment/:id, POST /equipment, PATCH /equipment/:id, DELETE /equipment/:id, GET /equipment/types
- `backend/src/modules/equipment/equipment.service.ts` (create) - Lógica CRUD, búsqueda con filtros, paginación
- `backend/src/modules/equipment/dto/create-equipment.dto.ts` (create) - DTO con validación class-validator
- `backend/src/modules/equipment/dto/update-equipment.dto.ts` (create) - DTO parcial para updates
- `backend/src/modules/equipment/dto/equipment-filters.dto.ts` (create) - DTO para query params

*Loan Module:*
- `backend/src/modules/loan/loan.module.ts` (create) - Module con LoanController, LoanService
- `backend/src/modules/loan/loan.controller.ts` (create) - Endpoints: GET /loans, GET /loans/my, GET /loans/pending, GET /loans/overdue, GET /loans/:id, POST /loans, POST /loans/:id/approve, POST /loans/:id/reject, POST /loans/:id/return, POST /loans/:id/cancel
- `backend/src/modules/loan/loan.service.ts` (create) - Lógica de préstamos, cambios de estado, detección overdue
- `backend/src/modules/loan/dto/create-loan.dto.ts` (create) - DTO para crear préstamo
- `backend/src/modules/loan/dto/approve-loan.dto.ts` (create) - DTO para approve/reject
- `backend/src/modules/loan/dto/return-loan.dto.ts` (create) - DTO para registrar devolución
- `backend/src/modules/loan/dto/loan-filters.dto.ts` (create) - DTO para query params

*Common Interceptors:*
- `backend/src/common/interceptors/audit.interceptor.ts` (create) - Interceptor que registra acciones en audit_log

**Dependencies:** Item 1, Item 2  
**Validation:** `curl http://localhost:23000/api/health` retorna status ok; `GET /equipment` retorna array paginado  
**Role:** role-be (backend_developer)

---

### ITEM 4: Backend — Collaborator, Audit-Log, Manager & Health Modules

**Goal:** Implementar módulos de colaborador, auditoría, manager dashboard y health check. Incluye stats del manager, reportes con exportación CSV/PDF, historial de auditoría y endpoint de salud.

**Files to create:**

*Collaborator Module:*
- `backend/src/modules/collaborator/collaborator.module.ts` (create) - Module con CollaboratorController, CollaboratorService
- `backend/src/modules/collaborator/collaborator.controller.ts` (create) - Endpoints: GET /collaborators, GET /collaborators/:id, GET /collaborators/me
- `backend/src/modules/collaborator/collaborator.service.ts` (create) - Lógica de búsqueda de colaboradores
- `backend/src/modules/collaborator/dto/collaborator-filters.dto.ts` (create) - DTO para filtros

*Audit-Log Module:*
- `backend/src/modules/audit-log/audit-log.module.ts` (create) - Module con AuditLogController, AuditLogService
- `backend/src/modules/audit-log/audit-log.controller.ts` (create) - Endpoints: GET /audit-logs, GET /audit-logs/loan/:loanId
- `backend/src/modules/audit-log/audit-log.service.ts` (create) - Lógica de consulta de auditoría
- `backend/src/modules/audit-log/dto/audit-log-filters.dto.ts` (create) - DTO para filtros

*Manager Module:*
- `backend/src/modules/manager/manager.module.ts` (create) - Module con ManagerController, ManagerService
- `backend/src/modules/manager/manager.controller.ts` (create) - Endpoints: GET /manager/stats, GET /manager/reports/loans, GET /manager/reports/export
- `backend/src/modules/manager/manager.service.ts` (create) - Lógica de estadísticas y generación de reportes CSV/PDF
- `backend/src/modules/manager/dto/report-filters.dto.ts` (create) - DTO para filtros de reportes

*Health Module:*
- `backend/src/modules/health/health.module.ts` (create) - Module con HealthController
- `backend/src/modules/health/health.controller.ts` (create) - Endpoints: GET /health, GET /metrics

*App Module:*
- `backend/src/app.module.ts` (create) - Root module que importa todos los feature modules

*Entry Point:*
- `backend/src/main.ts` (create) - Bootstrap de NestJS con validation pipe, Swagger, CORS

**Dependencies:** Item 1, Item 2, Item 3  
**Validation:** `curl http://localhost:23000/api/health` retorna `{status: "ok", timestamp: "..."}`  
**Role:** role-be (backend_developer)

---

### ITEM 5: Backend — Dockerfile, package.json y tsconfig

**Goal:** Crear todos los archivos de configuración del backend: package.json con dependencias, tsconfig.json, nest-cli.json, Dockerfile multi-stage para producción.

**Files to create:**

*Configuration Files:*
- `backend/package.json` (create) - Dependencias: @nestjs/core, @nestjs/typeorm, @azure/msal-node, class-validator, swagger, etc.
- `backend/tsconfig.json` (create) - Config TypeScript con experimentalDecorators, emitDecoratorMetadata, strict
- `backend/tsconfig.build.json` (create) - Config para build
- `backend/nest-cli.json` (create) - NestJS CLI config

*Dockerfile:*
- `backend/Dockerfile` (create) - Multi-stage: node:20-alpine build → node:20-alpine production. EXPOSE 3000, CMD npm run start:prod

*Entrypoint:*
- `backend/docker-entrypoint.sh` (create) - Script que espera DB, ejecuta migrations, seed si necesario

*Tests:*
- `backend/test/app.e2e-spec.ts` (create) - Test E2E básico

**Dependencies:** Item 1, Item 2, Item 3, Item 4  
**Validation:** `docker build -t apiux-backend ./backend` completa exitosamente  
**Role:** role-be (backend_developer)

---

### ITEM 6: Frontend — Core (AuthContext, hooks, API client, styles)

**Goal:** Implementar la base del frontend: AuthContext con Azure AD (MSAL React), hooks personalizados (useEquipment, useLoan, useManager), cliente API configurado, estilos base con design tokens.

**Files to create:**

*Entry & Layout:*
- `frontend/src/main.tsx` (create) - React entry point con AuthProvider
- `frontend/src/App.tsx` (create) - Router principal con rutas protegidas
- `frontend/src/index.css` (create) - Estilos base globales

*Auth Context:*
- `frontend/src/contexts/AuthContext.tsx` (create) - Context con user, isAuthenticated, login, logout
- `frontend/src/hooks/useAuth.ts` (create) - Hook que consume AuthContext

*API Client:*
- `frontend/src/api/client.ts` (create) - Axios instance con interceptor de auth
- `frontend/src/api/endpoints.ts` (create) - API methods organizados por dominio (equipmentApi, loanApi, etc.)

*Hooks:*
- `frontend/src/hooks/useEquipment.ts` (create) - Hook con fetchEquipment, createEquipment, updateEquipment, deleteEquipment
- `frontend/src/hooks/useLoan.ts` (create) - Hook con fetchLoans, fetchMyLoans, fetchPendingLoans, approveLoan, returnLoan, etc.
- `frontend/src/hooks/useManager.ts` (create) - Hook con fetchStats, exportReport

*Config:*
- `frontend/vite.config.ts` (create) - Vite config con proxy para API
- `frontend/tsconfig.json` (create) - TypeScript config
- `frontend/tsconfig.node.json` (create) - Node types config

**Dependencies:** Item 1  
**Validation:** `cd frontend && npm install && npm run dev` inicia servidor de desarrollo en puerto 5173  
**Role:** role-fe (frontend_developer)

---

### ITEM 7: Frontend — UI Components (base components)

**Goal:** Implementar todos los componentes base del sistema de diseño según el contrato UI/UX: PrimaryButton, InputField, PageHeader, Navigation, EquipmentCard, DataTable, ConfirmModal, Alert. Cada componente usa los design tokens verbatim.

**Files to create:**

*Base UI Components:*
- `frontend/src/components/ui/PrimaryButton.tsx` (create) - Button con variants (primary, secondary, danger), loading state, sizes
- `frontend/src/components/ui/InputField.tsx` (create) - Input con label, error state, required indicator
- `frontend/src/components/ui/PageHeader.tsx` (create) - Header con title, subtitle, back button, actions slot
- `frontend/src/components/ui/Navigation.tsx` (create) - Nav con brand logo, menu items, user profile dropdown
- `frontend/src/components/ui/EquipmentCard.tsx` (create) - Card con info de equipo, badge de status, acciones (request loan, edit, delete)
- `frontend/src/components/ui/DataTable.tsx` (create) - Table genérica con columns config, pagination, row click handler
- `frontend/src/components/ui/ConfirmModal.tsx` (create) - Modal de confirmación con variant primary/danger
- `frontend/src/components/ui/Alert.tsx` (create) - Alert con types (success, error, warning, info)

*HTML Template:*
- `frontend/index.html` (create) - HTML base con font Inter y div#root
- `frontend/public/index.html` (create) - Copia en public folder

**Dependencies:** Item 1, Item 6  
**Validation:** `cd frontend && npm run build` genera bundle sin errores de TypeScript  
**Role:** role-fe (frontend_developer)

---

### ITEM 8: Frontend — Login Page

**Goal:** Implementar la página de Login según el diseño UI/UX: panel izquierdo corporativo con logo y mensaje, área derecha con botón "Iniciar sesión con Microsoft". Flujo OAuth redirection a Azure AD.

**Files to create:**

*Login Page:*
- `frontend/src/pages/Login.tsx` (create) - Página completa con layout de dos paneles, botón CTA de Azure AD, footer

**Dependencies:** Item 1, Item 6, Item 7  
**Validation:** Navegar a http://localhost:25173 muestra la página de login con branding Apiux  
**Role:** role-fe (frontend_developer)

---

### ITEM 9: Frontend — Catalog Page (Catálogo de Equipos)

**Goal:** Implementar la página del catálogo de equipos según el diseño UI/UX: header con navegación, hero section, barra de búsqueda y filtros (tipo, estado), grid de EquipmentCards, paginación. Funcionalidad de solicitud de préstamo para colaboradores.

**Files to create:**

*Catalog Page:*
- `frontend/src/pages/Catalog.tsx` (create) - Página completa con search bar, filters dropdowns, equipment grid, pagination, loan request modal

**Dependencies:** Item 1, Item 6, Item 7, Item 8  
**Validation:** Después de login, navegar a /catalog muestra equipos con filtros funcionales y botón "Solicitar préstamo"  
**Role:** role-fe (frontend_developer)

---

### ITEM 10: Frontend — Manager Panel Page

**Goal:** Implementar la página del panel del encargado según el diseño UI/UX: header con stats cards (total, disponible, prestado, pendiente), tabs para préstamos pendientes/aprobados/vencidos, tabla de solicitudes con acciones (aprobar, rechazar, devolver), sección de historial de auditoría. Exportación de reportes CSV/PDF.

**Files to create:**

*Manager Panel Page:*
- `frontend/src/pages/ManagerPanel.tsx` (create) - Dashboard con stats, tabs de préstamos, tabla con acciones, panel de auditoría, export buttons

**Dependencies:** Item 1, Item 6, Item 7, Item 8, Item 9  
**Validation:** Login como manager, navegar a /manager muestra dashboard con estadísticas y lista de préstamos pendientes con botones de aprobar/rechazar  
**Role:** role-fe (frontend_developer)

---

### ITEM 11: Frontend — Dockerfile y package.json

**Goal:** Crear configuración y Dockerfile del frontend: package.json con dependencias React, vite, axios, msal, Dockerfile multi-stage con nginx para producción.

**Files to create:**

*Configuration Files:*
- `frontend/package.json` (create) - Dependencias: react, react-dom, react-router-dom, axios, @azure/msal-react, @azure/msal-browser

*Dockerfile:*
- `frontend/Dockerfile` (create) - Multi-stage: node:20-alpine build (con ARG VITE_API_URL) → nginx:alpine serve. EXPOSE 80

**Dependencies:** Item 1, Item 6, Item 7, Item 8, Item 9, Item 10  
**Validation:** `docker build -t apiux-frontend ./frontend` completa exitosamente  
**Role:** role-fe (frontend_developer)

---

### ITEM 12: Infrastructure & Deployment

**Goal:** Crear la infraestructura completa para levantar todos los servicios con Docker: docker-compose.yml con backend, frontend, PostgreSQL, healthchecks; run.sh para startup automático; .env.example documentado; README.md con instrucciones.

**Files to create:**

*Docker Orchestration:*
- `docker-compose.yml` (create) - Services: postgres (port 25432), backend (port 23000, depends_on postgres healthy), frontend (port 25173, depends_on backend healthy). Healthchecks en todos. Networks y volumes.

*Scripts & Docs:*
- `run.sh` (create) - Script que valida Docker, ejecuta docker-compose up -d, espera servicios healthy, imprime URLs de acceso
- `README.md` (create) - Documentación: prerequisites, clone, run (./run.sh), endpoints, environment variables
- `.env.example` (create) - Todas las variables documentadas: DATABASE_HOST, DATABASE_PORT, AZURE_AD_*, FRONTEND_URL, VITE_*, etc.
- `.gitignore` (create) - Excluye node_modules, dist, .env, __pycache__
- `.dockerignore` (create) - Excluye .git, node_modules, *.log, dist

*Architecture Docs:*
- `docs/architecture.md` (create) - Diagrama del sistema, descripción de componentes, flujo de datos

**Dependencies:** Item 1, Item 2, Item 3, Item 4, Item 5, Item 6, Item 7, Item 8, Item 9, Item 10, Item 11  
**Validation:** `./run.sh` levanta todos los servicios; curl http://localhost:23000/api/health retorna ok; http://localhost:25173 muestra la aplicación  
**Role:** role-devops (devops_support)