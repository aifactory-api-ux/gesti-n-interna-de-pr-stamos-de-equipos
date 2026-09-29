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
