import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Equipment } from '../../entities/equipment.entity';
import { Loan } from '../../entities/loan.entity';
import { Collaborator } from '../../entities/collaborator.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { EquipmentStatus, LoanStatus, ApprovalStatus } from '../../enums';
import { ReportFiltersDto } from './dto/report-filters.dto';

export interface ManagerStats {
  total_equipment: number;
  available_equipment: number;
  loaned_equipment: number;
  maintenance_equipment: number;
  retired_equipment: number;
  total_collaborators: number;
  active_loans: number;
  pending_approvals: number;
  overdue_loans: number;
  returned_today: number;
  loans_this_month: number;
}

@Injectable()
export class ManagerService {
  private readonly logger = new Logger(ManagerService.name);

  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async getStats(): Promise<ManagerStats> {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalEquipment,
      availableEquipment,
      loanedEquipment,
      maintenanceEquipment,
      retiredEquipment,
      totalCollaborators,
      activeLoans,
      pendingApprovals,
      overdueLoans,
      returnedToday,
      loansThisMonth,
    ] = await Promise.all([
      this.equipmentRepository.count(),
      this.equipmentRepository.count({ where: { status: EquipmentStatus.AVAILABLE } }),
      this.equipmentRepository.count({ where: { status: EquipmentStatus.LOANED } }),
      this.equipmentRepository.count({ where: { status: EquipmentStatus.MAINTENANCE } }),
      this.equipmentRepository.count({ where: { status: EquipmentStatus.RETIRED } }),
      this.collaboratorRepository.count(),
      this.loanRepository.count({
        where: { status: LoanStatus.ACTIVE, approval_status: ApprovalStatus.APPROVED },
      }),
      this.loanRepository.count({
        where: { approval_status: ApprovalStatus.PENDING },
      }),
      this.loanRepository.count({
        where: { status: LoanStatus.OVERDUE },
      }),
      this.loanRepository.count({
        where: {
          return_date: MoreThanOrEqual(startOfToday),
          status: LoanStatus.RETURNED,
        },
      }),
      this.loanRepository.count({
        where: {
          loan_date: MoreThanOrEqual(startOfMonth),
        },
      }),
    ]);

    return {
      total_equipment: totalEquipment,
      available_equipment: availableEquipment,
      loaned_equipment: loanedEquipment,
      maintenance_equipment: maintenanceEquipment,
      retired_equipment: retiredEquipment,
      total_collaborators: totalCollaborators,
      active_loans: activeLoans,
      pending_approvals: pendingApprovals,
      overdue_loans: overdueLoans,
      returned_today: returnedToday,
      loans_this_month: loansThisMonth,
    };
  }

  async getLoansReport(filters: ReportFiltersDto): Promise<Loan[]> {
    const { start_date, end_date } = filters;

    const where: any = {};
    if (start_date && end_date) {
      where.loan_date = Between(new Date(start_date), new Date(end_date));
    } else if (start_date) {
      where.loan_date = MoreThanOrEqual(new Date(start_date));
    } else if (end_date) {
      where.loan_date = LessThanOrEqual(new Date(end_date));
    }

    return this.loanRepository.find({
      where,
      relations: ['equipment', 'collaborator'],
      order: { loan_date: 'DESC' },
    });
  }

  async exportReport(filters: ReportFiltersDto): Promise<{ format: string; data: string }> {
    const { format = 'csv', start_date, end_date } = filters;

    const where: any = {};
    if (start_date && end_date) {
      where.loan_date = Between(new Date(start_date), new Date(end_date));
    } else if (start_date) {
      where.loan_date = MoreThanOrEqual(new Date(start_date));
    } else if (end_date) {
      where.loan_date = LessThanOrEqual(new Date(end_date));
    }

    const loans = await this.loanRepository.find({
      where,
      relations: ['equipment', 'collaborator'],
      order: { loan_date: 'DESC' },
    });

    if (format === 'csv') {
      return {
        format: 'csv',
        data: this.generateCsv(loans),
      };
    }

    return {
      format: 'pdf',
      data: this.generatePdfData(loans),
    };
  }

  private generateCsv(loans: Loan[]): string {
    const headers = [
      'ID Préstamo',
      'Equipo',
      'Tipo Equipo',
      'Serial',
      'Colaborador',
      'Email Colaborador',
      'Fecha Préstamo',
      'Fecha Devolución',
      'Fecha Vencimiento',
      'Estado',
      'Estado Aprobación',
    ];

    const rows = loans.map((loan) => [
      loan.id,
      loan.equipment?.name || '',
      loan.equipment?.type || '',
      loan.equipment?.serial_number || '',
      loan.collaborator?.name || '',
      loan.collaborator?.email || '',
      loan.loan_date ? new Date(loan.loan_date).toISOString() : '',
      loan.return_date ? new Date(loan.return_date).toISOString() : '',
      loan.due_date ? new Date(loan.due_date).toISOString() : '',
      loan.status,
      loan.approval_status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','),
      ),
    ].join('\n');

    return csvContent;
  }

  private generatePdfData(loans: Loan[]): string {
    const stats = loans.reduce(
      (acc, loan) => {
        acc.total++;
        if (loan.status === LoanStatus.ACTIVE) acc.active++;
        if (loan.status === LoanStatus.RETURNED) acc.returned++;
        if (loan.status === LoanStatus.OVERDUE) acc.overdue++;
        return acc;
      },
      { total: 0, active: 0, returned: 0, overdue: 0 },
    );

    const summary = `
REPORTE DE PRÉSTAMOS
====================
Fecha de generación: ${new Date().toISOString()}
Período: ${this.formatDate(loans[loans.length - 1]?.loan_date)} - ${this.formatDate(loans[0]?.loan_date)}

RESUMEN
-------
Total de préstamos: ${stats.total}
Préstamos activos: ${stats.active}
Préstamos devueltos: ${stats.returned}
Préstamos vencidos: ${stats.overdue}

DETALLE DE PRÉSTAMOS
--------------------
${loans
  .map(
    (loan) =>
      `- ${loan.equipment?.name} (${loan.equipment?.type})
  Colaborador: ${loan.collaborator?.name}
  Fecha: ${this.formatDate(loan.loan_date)}
  Estado: ${loan.status} / ${loan.approval_status}`,
  )
  .join('\n\n')}
`;

    return summary;
  }

  private formatDate(date: Date | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-CL', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
}
