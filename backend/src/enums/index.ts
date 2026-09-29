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
