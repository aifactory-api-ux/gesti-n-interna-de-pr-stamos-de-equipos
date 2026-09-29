```markdown
# SPEC.md — Préstamo de Equipos Apiux

## 1. TECHNOLOGY STACK

| Layer | Technology | Version |
|-------|------------|---------|
| Backend Runtime | Node.js | 20 |
| Backend Framework | NestJS | 10.x |
| Database | PostgreSQL | 15 |
| Frontend Framework | React | 18 |
| Frontend Build Tool | Vite | 5.x |
| Frontend Language | TypeScript | 5.x |
| Containerization | Docker | Latest |
| Authentication | Azure AD SDK | @azure/msal-node 2.x, @azure/msal-react 2.x |
| Cloud Platform | GCP | App Engine / Cloud Run |
| ORM | TypeORM | 0.3.x |
| Validation | class-validator | 0.14.x |
| API Documentation | @nestjs/swagger | 7.x |

---

## 2. DATA CONTRACTS

All entity names and field names MUST match the ARCHITECT DATABASE SCHEMA CONTRACT exactly.

### 2.1 Backend — TypeORM Entities (NestJS / TypeScript)

```typescript
// backend/src/entities/collaborator.entity.ts
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Loan } from './loan.entity';

@Entity('collaborator')
export class Collaborator {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'azure_ad_id', type: 'varchar', length: 255, nullable: true })
  azure_ad_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @OneToMany(() => Loan, (loan) => loan.collaborator)
  loans: Loan[];
}
```

```typescript
// backend/src/entities/equipment.entity.ts
import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Loan } from './loan.entity';

@Entity('equipment')
export class Equipment {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'serial_number', type: 'varchar', length: 255, nullable: true })
  serial_number: string;

  @OneToMany(() => Loan, (loan) => loan.equipment)
  loans: Loan[];
}
```

```typescript
// backend/src/entities/loan.entity.ts
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Equipment } from './equipment.entity';
import { Collaborator } from './collaborator.entity';
import { AuditLog } from './audit-log.entity';

@Entity('loan')
export class Loan {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'equipment_id', type: 'varchar', length: 255 })
  equipment_id: string;

  @Column({ name: 'collaborator_id', type: 'varchar', length: 255 })
  collaborator_id: string;

  @Column({ name: 'loan_date', type: 'timestamptz' })
  loan_date: Date;

  @Column({ name: 'due_date', type: 'timestamptz', nullable: true })
  due_date: Date;

  @Column({ name: 'return_date', type: 'timestamptz', nullable: true })
  return_date: Date;

  @Column({ type: 'varchar', length: 50 })
  status: string;

  @Column({ name: 'approval_status', type: 'varchar', length: 50 })
  approval_status: string;

  @Column({ name: 'approved_at', type: 'timestamptz', nullable: true })
  approved_at: Date;

  @Column({ name: 'approved_by', type: 'varchar', length: 255, nullable: true })
  approved_by: string;

  @ManyToOne(() => Equipment, (equipment) => equipment.loans)
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @ManyToOne(() => Collaborator, (collaborator) => collaborator.loans)
  @JoinColumn({ name: 'collaborator_id' })
  collaborator: Collaborator;

  @OneToMany(() => AuditLog, (auditLog) => auditLog.loan)
  audit_logs: AuditLog[];
}
```

```typescript
// backend/src/entities/audit-log.entity.ts
import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Loan } from './loan.entity';
import { Collaborator } from './collaborator.entity';

@Entity('audit_log')
export class AuditLog {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  id: string;

  @Column({ name: 'user_id', type: 'varchar', length: 255 })
  user_id: string;

  @Column({ type: 'varchar', length: 100 })
  action: string;

  @Column({ name: 'entity_type', type: 'varchar', length: 100 })
  entity_type: string;

  @Column({ name: 'entity_id', type: 'varchar', length: 255 })
  entity_id: string;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ type: 'text', nullable: true })
  details: string;

  @ManyToOne(() => Loan, (loan) => loan.audit_logs)
  @JoinColumn({ name: 'entity_id' })
  loan: Loan;

  @ManyToOne(() => Collaborator)
  @JoinColumn({ name: 'user_id' })
  user: Collaborator;
}
```

### 2.2 Frontend — TypeScript Interfaces

```typescript
// frontend/src/types/index.ts

export interface Collaborator {
  id: string;
  azure_ad_id: string;
  name: string;
  email: string;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: string;
  serial_number: string;
}

export interface Loan {
  id: string;
  equipment_id: string;
  collaborator_id: string;
  loan_date: string;
  due_date: string | null;
  return_date: string | null;
  status: string;
  approval_status: string;
  approved_at: string | null;
  approved_by: string | null;
  equipment?: Equipment;
  collaborator?: Collaborator;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  timestamp: string;
  details: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EquipmentFilters {
  type?: string;
  status?: string;
  search?: string;
}

export interface LoanFilters {
  status?: string;
  approval_status?: string;
}

export interface CreateLoanRequest {
  equipment_id: string;
  due_date?: string;
}

export interface ApproveLoanRequest {
  approved_by: string;
}

export interface RegisterReturnRequest {
  loan_id: string;
}

export interface CreateEquipmentRequest {
  name: string;
  type: string;
  serial_number?: string;
}

export interface UpdateEquipmentRequest {
  name?: string;
  type?: string;
  status?: string;
  serial_number?: string;
}

export interface AuthUser {
  id: string;
  azure_ad_id: string;
  name: string;
  email: string;
  is_manager: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ManagerStats {
  total_equipment: number;
  available_equipment: number;
  loaned_equipment: number;
  pending_requests: number;
}
```

### 2.3 Shared Enums

```typescript
// backend/src/enums/index.ts
export enum EquipmentStatus {
  AVAILABLE = 'available',
  LOANED = 'loaned',
  MAINTENANCE = 'maintenance',
  RETIRED = 'retired',
}

export enum EquipmentType {
  NOTEBOOK = 'notebook',
  MONITOR = 'monitor',
  KEYBOARD = 'keyboard',
  MOUSE = 'mouse',
  HEADSET = 'headset',
  CABLE = 'cable',
  ADAPTER = 'adapter',
  OTHER = 'other',
}

export enum LoanStatus {
  ACTIVE = 'active',
  RETURNED = 'returned',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled',
}

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum AuditAction {
  EQUIPMENT_CREATED = 'equipment_created',
  EQUIPMENT_UPDATED = 'equipment_updated',
  EQUIPMENT_DELETED = 'equipment_deleted',
  LOAN_REQUESTED = 'loan_requested',
  LOAN_APPROVED = 'loan_approved',
  LOAN_REJECTED = 'loan_rejected',
  LOAN_RETURNED = 'loan_returned',
  LOAN_CANCELLED = 'loan_cancelled',
}
```

---

## 3. API ENDPOINTS

Base URL: `http://localhost:3000/api`

### 3.1 Authentication Endpoints

| Method | Path | Request Body | Response |
|--------|------|--------------|----------|
| GET | /auth/azure/callback | — | Redirect to frontend with tokens |
| GET | /auth/me | — | `AuthUser` |
| POST | /auth/logout | — | `{ success: true }` |
| GET | /auth/azure/login | — | Redirect to Azure AD |

```typescript
// GET /auth/me
// Response: AuthUser
// {
//   id: string;
//   azure_ad_id: string;
//   name: string;
//   email: string;
//   is_manager: boolean;
// }
```

### 3.2 Equipment Endpoints

| Method | Path | Request Body | Response |
|--------|------|--------------|----------|
| GET | /equipment | Query: `page`, `limit`, `type`, `status`, `search` | `PaginatedResponse<Equipment>` |
| GET | /equipment/:id | — | `Equipment` |
| POST | /equipment | `CreateEquipmentRequest` | `Equipment` |
| PATCH | /equipment/:id | `UpdateEquipmentRequest` | `Equipment` |
| DELETE | /equipment/:id | — | `{ success: true }` |
| GET | /equipment/types | — | `string[]` |

```typescript
// GET /equipment?page=1&limit=10&type=notebook&status=available&search=macbook
// Response:
{
  data: Equipment[],
  total: number,
  page: number,
  limit: number,
  totalPages: number
}

// POST /equipment
// Request:
{
  name: string;
  type: string;
  serial_number?: string;
}

// PATCH /equipment/:id
// Request:
{
  name?: string;
  type?: string;
  status?: string;
  serial_number?: string;
}
```

### 3.3 Loan Endpoints

| Method | Path | Request Body | Response |
|--------|------|--------------|----------|
| GET | /loans | Query: `page`, `limit`, `status`, `approval_status` | `PaginatedResponse<Loan>` |
| GET | /loans/my | Query: `page`, `limit` | `PaginatedResponse<Loan>` |
| GET | /loans/pending | Query: `page`, `limit` | `PaginatedResponse<Loan>` |
| GET | /loans/overdue | Query: `page`, `limit` | `PaginatedResponse<Loan>` |
| GET | /loans/:id | — | `Loan` |
| POST | /loans | `CreateLoanRequest` | `Loan` |
| POST | /loans/:id/approve | `ApproveLoanRequest` | `Loan` |
| POST | /loans/:id/reject | `ApproveLoanRequest` | `Loan` |
| POST | /loans/:id/return | `RegisterReturnRequest` | `Loan` |
| POST | /loans/:id/cancel | — | `Loan` |

```typescript
// GET /loans/pending?page=1&limit=10
// Response: PaginatedResponse<Loan>

// POST /loans
// Request:
{
  equipment_id: string;
  due_date?: string;
}

// POST /loans/:id/approve
// Request:
{
  approved_by: string;
}

// POST /loans/:id/return
// Request:
{
  loan_id: string;
}
```

### 3.4 Collaborator Endpoints

| Method | Path | Request Body | Response |
|--------|------|--------------|----------|
| GET | /collaborators | Query: `page`, `limit`, `search` | `PaginatedResponse<Collaborator>` |
| GET | /collaborators/:id | — | `Collaborator` |
| GET | /collaborators/me | — | `Collaborator` |

### 3.5 Audit Log Endpoints

| Method | Path | Request Body | Response |
|--------|------|--------------|----------|
| GET | /audit-logs | Query: `page`, `limit`, `entity_type`, `entity_id`, `user_id` | `PaginatedResponse<AuditLog>` |
| GET | /audit-logs/loan/:loanId | — | `AuditLog[]` |

### 3.6 Manager Dashboard Endpoints

| Method | Path | Request Body | Response |
|--------|------|--------------|----------|
| GET | /manager/stats | — | `ManagerStats` |
| GET | /manager/reports/loans | Query: `start_date`, `end_date` | `Loan[]` |
| GET | /manager/reports/export | Query: `format`, `start_date`, `end_date` | File (CSV/PDF) |

```typescript
// GET /manager/stats
// Response:
{
  total_equipment: number;
  available_equipment: number;
  loaned_equipment: number;
  pending_requests: number;
}

// GET /manager/reports/export?format=csv&start_date=2024-01-01&end_date=2024-12-31
// Response: CSV file download

// GET /manager/reports/export?format=pdf&start_date=2024-01-01&end_date=2024-12-31
// Response: PDF file download
```

### 3.7 Health & Metrics Endpoints

| Method | Path | Response |
|--------|------|----------|
| GET | /health | `{ status: string, timestamp: string }` |
| GET | /metrics | Prometheus-formatted metrics |

---

## 4. FILE STRUCTURE

```
prestamo-equipos-apiux/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── config/
│   │   │   ├── database.config.ts
│   │   │   └── azure.config.ts
│   │   ├── entities/
│   │   │   ├── collaborator.entity.ts
│   │   │   ├── equipment.entity.ts
│   │   │   ├── loan.entity.ts
│   │   │   └── audit-log.entity.ts
│   │   ├── enums/
│   │   │   └── index.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.guard.ts
│   │   │   │   ├── azure.strategy.ts
│   │   │   │   └── dto/
│   │   │   │       └── auth-callback.dto.ts
│   │   │   ├── equipment/
│   │   │   │   ├── equipment.module.ts
│   │   │   │   ├── equipment.controller.ts
│   │   │   │   ├── equipment.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-equipment.dto.ts
│   │   │   │       ├── update-equipment.dto.ts
│   │   │   │       └── equipment-filters.dto.ts
│   │   │   ├── loan/
│   │   │   │   ├── loan.module.ts
│   │   │   │   ├── loan.controller.ts
│   │   │   │   ├── loan.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-loan.dto.ts
│   │   │   │       ├── approve-loan.dto.ts
│   │   │   │       ├── return-loan.dto.ts
│   │   │   │       └── loan-filters.dto.ts
│   │   │   ├── collaborator/
│   │   │   │   ├── collaborator.module.ts
│   │   │   │   ├── collaborator.controller.ts
│   │   │   │   ├── collaborator.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── collaborator-filters.dto.ts
│   │   │   ├── audit-log/
│   │   │   │   ├── audit-log.module.ts
│   │   │   │   ├── audit-log.controller.ts
│   │   │   │   ├── audit-log.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── audit-log-filters.dto.ts
│   │   │   ├── manager/
│   │   │   │   ├── manager.module.ts
│   │   │   │   ├── manager.controller.ts
│   │   │   │   ├── manager.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── report-filters.dto.ts
│   │   │   └── health/
│   │   │       ├── health.module.ts
│   │   │       └── health.controller.ts
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   │   ├── current-user.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── filters/
│   │   │   │   └── http-exception.filter.ts
│   │   │   ├── interceptors/
│   │   │   │   └── audit.interceptor.ts
│   │   │   └── utils/
│   │   │       └── uuid.ts
│   │   └── types/
│   │       └── index.ts
│   ├── test/
│   │   └── app.e2e-spec.ts
│   ├── Dockerfile
│   ├── docker-entrypoint.sh
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── nest-cli.json
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── components/
│   │   │   └── ui/
│   │   │       ├── PrimaryButton.tsx
│   │   │       ├── InputField.tsx
│   │   │       ├── PageHeader.tsx
│   │   │       ├── Navigation.tsx
│   │   │       ├── EquipmentCard.tsx
│   │   │       ├── DataTable.tsx
│   │   │       ├── ConfirmModal.tsx
│   │   │       └── Alert.tsx
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useEquipment.ts
│   │   │   ├── useLoan.ts
│   │   │   └── useManager.ts
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Catalog.tsx
│   │   │   └── ManagerPanel.tsx
│   │   ├── styles/
│   │   │   └── tokens.ts
│   │   └── types/
│   │       └── index.ts
│   ├── public/
│   │   └── index.html
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── index.html
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

### PORT TABLE

| Service | Listening Port | Path |
|---------|----------------|------|
| backend | 3000 | backend/ |
| frontend | 5173 | frontend/ |
| PostgreSQL | 5432 (internal) | — |

Host mapping (within Docker network):
| Service | Internal Port | Host Port |
|---------|---------------|-----------|
| backend | 3000 | 23000 |
| frontend | 5173 | 25173 |
| PostgreSQL | 5432 | 25432 |

---

## 5. ENVIRONMENT VARIABLES

### Backend (.env)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `NODE_ENV` | string | Environment mode | `production` |
| `PORT` | number | Server port | `3000` |
| `DATABASE_HOST` | string | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | number | PostgreSQL port | `5432` |
| `DATABASE_NAME` | string | Database name | `prestamo_equipos` |
| `DATABASE_USER` | string | Database username | `postgres` |
| `DATABASE_PASSWORD` | string | Database password | `secretpassword` |
| `AZURE_AD_CLIENT_ID` | string | Azure AD app client ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_AD_TENANT_ID` | string | Azure AD tenant ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `AZURE_AD_CLIENT_SECRET` | string | Azure AD client secret | `secret` |
| `AZURE_AD_REDIRECT_URI` | string | OAuth callback URL | `http://localhost:3000/api/auth/azure/callback` |
| `AZURE_AD_SCOPES` | string | OAuth scopes (comma-separated) | `openid,profile,email` |
| `FRONTEND_URL` | string | Frontend base URL | `http://localhost:5173` |
| `SESSION_SECRET` | string | Session encryption key | `randomsecret123` |
| `ENABLE_AUDIT_LOG` | boolean | Enable audit logging | `true` |

### Frontend (.env)

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `VITE_API_BASE_URL` | string | Backend API base URL | `http://localhost:3000/api` |
| `VITE_AZURE_AD_CLIENT_ID` | string | Azure AD client ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `VITE_AZURE_AD_REDIRECT_URI` | string | OAuth redirect URI | `http://localhost:5173/auth/callback` |
| `VITE_AZURE_AD_POST_LOGOUT_REDIRECT_URI` | string | Logout redirect URI | `http://localhost:5173/login` |
| `VITE_ENVIRONMENT` | string | Environment name | `development` |

---

## 6. IMPORT CONTRACTS

### Backend Shared Exports

```typescript
// backend/src/entities/index.ts
export { Collaborator } from './collaborator.entity';
export { Equipment } from './equipment.entity';
export { Loan } from './loan.entity';
export { AuditLog } from './audit-log.entity';

// backend/src/enums/index.ts
export { EquipmentStatus, EquipmentType, LoanStatus, ApprovalStatus, AuditAction } from './index';

// backend/src/types/index.ts
export interface AuthUser {
  id: string;
  azure_ad_id: string;
  name: string;
  email: string;
  is_manager: boolean;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// backend/src/common/utils/uuid.ts
export { generateUUID } from './uuid';
```

### Frontend Shared Exports

```typescript
// frontend/src/types/index.ts
export {
  Collaborator,
  Equipment,
  Loan,
  AuditLog,
  PaginationParams,
  PaginatedResponse,
  EquipmentFilters,
  LoanFilters,
  CreateLoanRequest,
  ApproveLoanRequest,
  RegisterReturnRequest,
  CreateEquipmentRequest,
  UpdateEquipmentRequest,
  AuthUser,
  ManagerStats,
} from './types';

// frontend/src/api/client.ts
export { apiClient } from './client';
export { equipmentApi, loanApi, collaboratorApi, authApi, managerApi, auditLogApi } from './endpoints';

// frontend/src/styles/tokens.ts
export { tokens } from './tokens';
```

---

## 7. FRONTEND STATE & COMPONENT CONTRACTS

### 7.1 React Context: AuthContext

```typescript
// frontend/src/contexts/AuthContext.tsx
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
  error: string | null;
}

export const useAuth = (): AuthContextType => {
  // Returns: { user, isAuthenticated, isLoading, login, logout, error }
};
```

### 7.2 React Hook: useEquipment

```typescript
// frontend/src/hooks/useEquipment.ts
interface UseEquipmentReturn {
  equipment: Equipment[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: EquipmentFilters;
  fetchEquipment: (filters?: EquipmentFilters) => Promise<void>;
  fetchEquipmentById: (id: string) => Promise<Equipment>;
  createEquipment: (data: CreateEquipmentRequest) => Promise<Equipment>;
  updateEquipment: (id: string, data: UpdateEquipmentRequest) => Promise<Equipment>;
  deleteEquipment: (id: string) => Promise<void>;
  setFilters: (filters: EquipmentFilters) => void;
  setPage: (page: number) => void;
}

export const useEquipment = (): UseEquipmentReturn => {
  // Returns all properties listed above
};
```

### 7.3 React Hook: useLoan

```typescript
// frontend/src/hooks/useLoan.ts
interface UseLoanReturn {
  loans: Loan[];
  myLoans: Loan[];
  pendingLoans: Loan[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  fetchLoans: (filters?: LoanFilters) => Promise<void>;
  fetchMyLoans: () => Promise<void>;
  fetchPendingLoans: () => Promise<void>;
  fetchLoanById: (id: string) => Promise<Loan>;
  createLoan: (data: CreateLoanRequest) => Promise<Loan>;
  approveLoan: (id: string, approvedBy: string) => Promise<Loan>;
  rejectLoan: (id: string, approvedBy: string) => Promise<Loan>;
  returnLoan: (id: string) => Promise<Loan>;
  cancelLoan: (id: string) => Promise<Loan>;
  setPage: (page: number) => void;
}

export const useLoan = (): UseLoanReturn => {
  // Returns all properties listed above
};
```

### 7.4 React Hook: useManager

```typescript
// frontend/src/hooks/useManager.ts
interface UseManagerReturn {
  stats: ManagerStats | null;
  loading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  exportReport: (format: 'csv' | 'pdf', startDate: string, endDate: string) => Promise<void>;
}

export const useManager = (): UseManagerReturn => {
  // Returns: { stats, loading, error, fetchStats, exportReport }
};
```

### 7.5 Component Props Interfaces

```typescript
// PrimaryButton.tsx
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
}

// InputField.tsx
interface InputFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'password' | 'search' | 'number';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

// PageHeader.tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

// Navigation.tsx
interface NavigationProps {
  isAuthenticated: boolean;
  user?: AuthUser;
  onLogout: () => void;
}

// EquipmentCard.tsx
interface EquipmentCardProps {
  equipment: Equipment;
  onRequestLoan?: (equipment: Equipment) => void;
  showActions?: boolean;
  isManager?: boolean;
  onEdit?: (equipment: Equipment) => void;
  onDelete?: (equipment: Equipment) => void;
}

// DataTable.tsx
interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
}

// ConfirmModal.tsx
interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger';
  loading?: boolean;
}

// Alert.tsx
interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose?: () => void;
  className?: string;
}
```

---

## 8. FILE EXTENSION CONVENTION

- **Frontend Language:** TypeScript
- **Frontend Files:** `.tsx` (React components with JSX) and `.ts` (utilities, hooks, types)
- **Backend Files:** `.ts` (TypeScript)
- **Entry Point:** `frontend/src/main.tsx`
- **Config Files:** `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`

---

## 9. DESIGN TOKENS

Exact token values copied verbatim from UI/UX contract.

```typescript
// frontend/src/styles/tokens.ts
export const tokens = {
  colors: {
    // Primary palette
    primary: '#0B2A4A',
    primaryLight: '#17324D',
    primaryDark: '#071E36',
    
    // Secondary / Accent
    accent: '#2563EB',
    accentLight: '#3B82F6',
    accentDark: '#1D4ED8',
    
    // Neutrals
    white: '#FFFFFF',
    background: '#F6F8FB',
    surface: '#FFFFFF',
    border: '#DCE3F0',
    borderLight: '#E8ECF4',
    
    // Text hierarchy
    textPrimary: '#17324D',
    textSecondary: '#5D7485',
    textTertiary: '#8A99AD',
    textInverse: '#FFFFFF',
    
    // Status colors
    success: '#059669',
    successLight: '#D1FAE5',
    successDark: '#047857',
    
    warning: '#D97706',
    warningLight: '#FEF3C7',
    warningDark: '#B45309',
    
    error: '#DC2626',
    errorLight: '#FEE2E2',
    errorDark: '#B91C1C',
    
    info: '#0284C7',
    infoLight: '#E0F2FE',
    infoDark: '#0369A1',
    
    // Equipment status
    available: '#059669',
    loaned: '#D97706',
    maintenance: '#6B7280',
    retired: '#9CA3AF',
    
    // Approval status
    pending: '#D97706',
    approved: '#059669',
    rejected: '#DC2626',
    
    // Special surfaces
    heroBackground: '#0B2A4A',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    
    // Font sizes
    fontSizeXs: '0.75rem',    // 12px
    fontSizeSm: '0.875rem',   // 14px
    fontSizeBase: '1rem',     // 16px
    fontSizeLg: '1.125rem',  // 18px
    fontSizeXl: '1.25rem',   // 20px
    fontSize2xl: '1.5rem',   // 24px
    fontSize3xl: '1.875rem', // 30px
    fontSize4xl: '2.25rem',  // 36px
    
    // Font weights
    fontWeightNormal: 400,
    fontWeightMedium: 500,
    fontWeightSemibold: 600,
    fontWeightBold: 700,
    
    // Line heights
    lineHeightTight: 1.25,
    lineHeightNormal: 1.5,
    lineHeightRelaxed: 1.75,
  },
  
  spacing: {
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
  },
  
  borderRadius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.5rem',    // 8px
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    full: '9999px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
  
  transitions: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
};
```

---

## 10. FUNCTIONAL REQUIREMENTS COVERAGE

| Requirement | Implementation | Files |
|-------------|----------------|-------|
| Azure AD login for all users | MSAL library integration with redirect flow, session management via JWT | `backend/src/modules/auth/auth.module.ts`, `backend/src/modules/auth/auth.controller.ts`, `backend/src/modules/auth/azure.strategy.ts`, `frontend/src/contexts/AuthContext.tsx`, `frontend/src/pages/Login.tsx` |
| Collaborator entity with Azure AD linkage | `azure_ad_id` field links Azure AD objectId to local user | `backend/src/entities/collaborator.entity.ts`, `backend/src/modules/auth/auth.service.ts` |
| Equipment catalog with search/filter | GET /equipment with query params: type, status, search, pagination | `backend/src/modules/equipment/equipment.controller.ts`, `backend/src/modules/equipment/equipment.service.ts`, `frontend/src/pages/Catalog.tsx`, `frontend/src/hooks/useEquipment.ts` |
| Equipment types: notebook, monitor, accessories | EquipmentType enum with all categories | `backend/src/enums/index.ts`, `frontend/src/types/index.ts` |
| Equipment status tracking | EquipmentStatus enum: available, loaned, maintenance, retired | `backend/src/enums/index.ts`, `frontend/src/types/index.ts` |
| Request equipment loan | POST /loans creates pending request, updates equipment status | `backend/src/modules/loan/loan.controller.ts`, `backend/src/modules/loan/loan.service.ts`, `frontend/src/components/ui/EquipmentCard.tsx` |
| Manager approval workflow | POST /loans/:id/approve, /loans/:id/reject with approval_status field | `backend/src/modules/loan/loan.service.ts`, `frontend/src/pages/ManagerPanel.tsx`, `frontend/src/hooks/useLoan.ts` |
| Register equipment return | POST /loans/:id/return sets return_date, status=returned, equipment status=available | `backend/src/modules/loan/loan.service.ts`, `frontend/src/pages/ManagerPanel.tsx` |
| Manager dashboard with stats | GET /manager/stats returns counts: total, available, loaned, pending | `backend/src/modules/manager/manager.controller.ts`, `backend/src/modules/manager/manager.service.ts`, `frontend/src/hooks/useManager.ts` |
| Pending loans table | GET /loans/pending with pagination for manager review | `backend/src/modules/loan/loan.controller.ts`, `frontend/src/pages/ManagerPanel.tsx` |
| Overdue loan detection | Loan status updated to 'overdue' when due_date < now and status='active' | `backend/src/modules/loan/loan.service.ts` |
| Full audit trail | AUDIT_LOG table tracks all entity changes with action, user_id, timestamp, details | `backend/src/entities/audit-log.entity.ts`, `backend/src/modules/audit-log/audit-log.service.ts`, `backend/src/common/interceptors/audit.interceptor.ts` |
| Loan history/reports | GET /loans with date filters, GET /manager/reports/loans | `backend/src/modules/loan/loan.controller.ts`, `backend/src/modules/manager/manager.controller.ts` |
| Export reports CSV/PDF | GET /manager/reports/export with format query param | `backend/src/modules/manager/manager.controller.ts`, `backend/src/modules/manager/manager.service.ts` |
| Inventory management (CRUD equipment) | POST/GET/PATCH/DELETE /equipment endpoints | `backend/src/modules/equipment/equipment.controller.ts`, `backend/src/modules/equipment/equipment.service.ts` |
| PostgreSQL database persistence | TypeORM with PostgreSQL driver, all entities map to tables | `backend/src/app.module.ts`, `backend/src/config/database.config.ts`, `backend/src/entities/*.entity.ts` |
| GCP deployment | Dockerfile for containerization, docker-compose for local dev | `backend/Dockerfile`, `frontend/Dockerfile`, `docker-compose.yml` |
| Health check endpoint | GET /health returns status and timestamp | `backend/src/modules/health/health.controller.ts` |
| Manager role-based access | Role checking via decorator, is_manager field on Collaborator | `backend/src/common/decorators/roles.decorator.ts`, `backend/src/modules/auth/auth.guard.ts` |
| User profile display | GET /collaborators/me returns current user data | `backend/src/modules/collaborator/collaborator.controller.ts`, `frontend/src/components/ui/Navigation.tsx` |
| Confirmation modals for critical actions | ConfirmModal component with variant prop (primary/danger) | `frontend/src/components/ui/ConfirmModal.tsx`, `frontend/src/pages/ManagerPanel.tsx` |
| Alert notifications | Alert component with type variants: success, error, warning, info | `frontend/src/components/ui/Alert.tsx`, `frontend/src/pages/Catalog.tsx`, `frontend/src/pages/ManagerPanel.tsx` |
| Pagination for all list views | Backend returns PaginatedResponse, frontend handles page state | `backend/src/modules/equipment/equipment.service.ts`, `frontend/src/components/ui/DataTable.tsx` |
| Responsive equipment card grid | CSS Grid layout with responsive breakpoints | `frontend/src/components/ui/EquipmentCard.tsx`, `frontend/src/pages/Catalog.tsx` |
| Equipment type filter dropdown | Equipment types list from GET /equipment/types | `backend/src/modules/equipment/equipment.controller.ts`, `frontend/src/pages/Catalog.tsx` |
| Equipment status filter dropdown | Status filter mapped to EquipmentStatus enum values | `frontend/src/pages/Catalog.tsx` |
| Search by equipment name | search query param on /equipment endpoint | `backend/src/modules/equipment/equipment.service.ts` |
| Sort by availability | equipment sorted by status field | `backend/src/modules/equipment/equipment.service.ts` |
| Login page with Azure AD button | Login page with corporate branding per UI spec | `frontend/src/pages/Login.tsx` |
| Corporate blue/white color scheme | Design tokens with primary #0B2A4A | `frontend/src/styles/tokens.ts` |
| Inter font family | typography.token.fontFamily = 'Inter' | `frontend/src/styles/tokens.ts` |
| Page header component | Reusable header with title, subtitle, back button, actions | `frontend/src/components/ui/PageHeader.tsx` |
| Main navigation component | Nav with brand, menu items, user context | `frontend/src/components/ui/Navigation.tsx` |
| Data table for loans list | Sortable columns, row click, pagination | `frontend/src/components/ui/DataTable.tsx` |
| Input field component | Label, error state, required indicator | `frontend/src/components/ui/InputField.tsx` |
| Primary button component | Variants: primary, secondary, danger; loading state | `frontend/src/components/ui/PrimaryButton.tsx` |

---

## 11. DATABASE SCHEMA (PostgreSQL)

```sql
-- Created by TypeORM migrations based on entities defined in §2

CREATE TABLE collaborator (
    id VARCHAR(255) PRIMARY KEY,
    azure_ad_id VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL
);

CREATE TABLE equipment (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'available',
    serial_number VARCHAR(255)
);

CREATE TABLE loan (
    id VARCHAR(255) PRIMARY KEY,
    equipment_id VARCHAR(255) NOT NULL REFERENCES equipment(id),
    collaborator_id VARCHAR(255) NOT NULL REFERENCES collaborator(id),
    loan_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    due_date TIMESTAMPTZ,
    return_date TIMESTAMPTZ,
    status VARCHAR(50) NOT NULL DEFAULT 'active',
    approval_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    approved_at TIMESTAMPTZ,
    approved_by VARCHAR(255)
);

CREATE TABLE audit_log (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255) NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details TEXT
);

-- Indexes for common queries
CREATE INDEX idx_equipment_status ON equipment(status);
CREATE INDEX idx_equipment_type ON equipment(type);
CREATE INDEX idx_loan_status ON loan(status);
CREATE INDEX idx_loan_approval_status ON loan(approval_status);
CREATE INDEX idx_loan_collaborator ON loan(collaborator_id);
CREATE INDEX idx_loan_equipment ON loan(equipment_id);
CREATE INDEX idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_timestamp ON audit_log(timestamp);
```

---

## 12. AZURE AD CONFIGURATION

### Required Azure AD App Registration Settings

| Setting | Value |
|---------|-------|
| Supported Account Types | "Accounts in this organizational directory only" |
| Redirect URIs | `http://localhost:3000/api/auth/azure/callback` (dev), `<GCP_PROD_URL>/api/auth/azure/callback` (prod) |
| Implicit Grant | Enable "ID tokens" |
| Token Version | v2.0 |
| Permissions | User.Read, email, profile, openid |

### Environment Variable Mapping

| Azure Portal Field | Environment Variable |
|--------------------|---------------------|
| Application (client) ID | `AZURE_AD_CLIENT_ID` |
| Directory (tenant) ID | `AZURE_AD_TENANT_ID` |
| Client secret value | `AZURE_AD_CLIENT_SECRET` |

---

## 13. DEPLOYMENT NOTES

### GCP Cloud Run Deployment

1. Build Docker images locally or via Cloud Build
2. Push images to Google Container Registry
3. Deploy backend service:
   - Set environment variables from Secret Manager
   - Configure SQL connection via Cloud SQL Proxy
   - Set min instances = 1 for cold start prevention
4. Deploy frontend as static files via Cloud Storage + Cloud CDN or Firebase Hosting

### Required GCP Services

- Cloud Run (backend API)
- Cloud SQL for PostgreSQL 15
- Cloud Storage (optional: for PDF exports storage)
- Secret Manager (for environment variables)
- Cloud Build (CI/CD)
- Cloud CDN + Firebase Hosting or Cloud Storage (frontend)

---

## 14. SECURITY CONSIDERATIONS

- All API endpoints except `/auth/azure/*` and `/health` require authentication
- JWT tokens stored in HTTP-only cookies
- CSRF protection via SameSite cookie attribute
- Rate limiting on authentication endpoints
- Input validation on all DTOs using class-validator
- SQL injection prevention via TypeORM parameterized queries
- XSS prevention via React's default escaping
- Azure AD tokens validated on every request
```