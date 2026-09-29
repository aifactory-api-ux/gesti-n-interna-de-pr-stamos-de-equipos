export interface AuthUser {
  id: string;
  azure_ad_id: string | null;
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

export interface CreateEquipmentDto {
  name: string;
  type: string;
  serial_number?: string;
}

export interface UpdateEquipmentDto {
  name?: string;
  type?: string;
  status?: string;
  serial_number?: string;
}

export interface CreateLoanDto {
  equipment_id: string;
  due_date?: string;
}

export interface ApproveLoanDto {
  approved_by: string;
}

export interface RegisterReturnDto {
  loan_id: string;
}

export interface EquipmentFiltersDto {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  search?: string;
}

export interface LoanFiltersDto {
  page?: number;
  limit?: number;
  status?: string;
  approval_status?: string;
}

export interface AuditLogFiltersDto {
  page?: number;
  limit?: number;
  entity_type?: string;
  entity_id?: string;
  user_id?: string;
}
