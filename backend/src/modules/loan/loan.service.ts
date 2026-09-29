import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, LessThan } from 'typeorm';
import { Loan } from '../../entities/loan.entity';
import { Equipment } from '../../entities/equipment.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { LoanStatus, ApprovalStatus, AuditAction, EquipmentStatus } from '../../enums';
import { PaginationResult } from '../../types';
import { generateUUID } from '../../common/utils/uuid';
import { CreateLoanDto } from './dto/create-loan.dto';
import { LoanFiltersDto } from './dto/loan-filters.dto';

@Injectable()
export class LoanService {
  private readonly logger = new Logger(LoanService.name);

  constructor(
    @InjectRepository(Loan)
    private readonly loanRepository: Repository<Loan>,
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(filters: LoanFiltersDto, userId?: string, isManager?: boolean): Promise<PaginationResult<Loan>> {
    const { page = 1, limit = 10, status, approval_status, collaborator_id, equipment_id } = filters;

    const where: FindOptionsWhere<Loan> = {};

    if (status) {
      where.status = status;
    }

    if (approval_status) {
      where.approval_status = approval_status;
    }

    if (collaborator_id) {
      where.collaborator_id = collaborator_id;
    }

    if (equipment_id) {
      where.equipment_id = equipment_id;
    }

    if (!isManager && userId) {
      where.collaborator_id = userId;
    }

    const [data, total] = await this.loanRepository.findAndCount({
      where,
      relations: ['equipment', 'collaborator'],
      skip: (page - 1) * limit,
      take: limit,
      order: { loan_date: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findMyLoans(userId: string): Promise<Loan[]> {
    return this.loanRepository.find({
      where: { collaborator_id: userId },
      relations: ['equipment'],
      order: { loan_date: 'DESC' },
    });
  }

  async findPendingLoans(filters: LoanFiltersDto): Promise<PaginationResult<Loan>> {
    return this.findAll({ ...filters, approval_status: ApprovalStatus.PENDING }, undefined, true);
  }

  async findOverdueLoans(filters: LoanFiltersDto): Promise<PaginationResult<Loan>> {
    const { page = 1, limit = 10 } = filters;
    const now = new Date();

    const [data, total] = await this.loanRepository.findAndCount({
      where: {
        status: LoanStatus.ACTIVE,
        approval_status: ApprovalStatus.APPROVED,
        due_date: LessThan(now),
      },
      relations: ['equipment', 'collaborator'],
      skip: (page - 1) * limit,
      take: limit,
      order: { due_date: 'ASC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Loan> {
    const loan = await this.loanRepository.findOne({
      where: { id },
      relations: ['equipment', 'collaborator', 'audit_logs'],
    });

    if (!loan) {
      throw new NotFoundException(`Préstamo con ID ${id} no encontrado`);
    }

    return loan;
  }

  async create(userId: string, createDto: CreateLoanDto): Promise<Loan> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id: createDto.equipment_id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipo con ID ${createDto.equipment_id} no encontrado`);
    }

    if (equipment.status === EquipmentStatus.LOANED) {
      const activeLoan = await this.loanRepository.findOne({
        where: {
          equipment_id: createDto.equipment_id,
          status: LoanStatus.ACTIVE,
          approval_status: ApprovalStatus.APPROVED,
        },
      });
      if (activeLoan) {
        throw new BadRequestException('El equipo ya está prestado actualmente');
      }
    }

    if (equipment.status !== EquipmentStatus.AVAILABLE && equipment.status !== EquipmentStatus.LOANED) {
      throw new BadRequestException(`El equipo no está disponible para préstamo (estado: ${equipment.status})`);
    }

    const loan = this.loanRepository.create({
      id: generateUUID(),
      equipment_id: createDto.equipment_id,
      collaborator_id: userId,
      loan_date: new Date(),
      due_date: createDto.due_date ? new Date(createDto.due_date) : null,
      status: LoanStatus.ACTIVE,
      approval_status: ApprovalStatus.PENDING,
    });

    const saved = await this.loanRepository.save(loan);

    await this.createAuditLog(
      userId,
      AuditAction.LOAN_REQUESTED,
      'loan',
      saved.id,
      JSON.stringify({
        equipment_id: createDto.equipment_id,
        due_date: createDto.due_date,
      }),
    );

    this.logger.log(`Préstamo creado: ${saved.id} por usuario ${userId}`);
    return this.findById(saved.id);
  }

  async approve(id: string, approvedBy: string): Promise<Loan> {
    const loan = await this.findById(id);

    if (loan.approval_status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Solo se pueden aprobar préstamos pendientes');
    }

    loan.approval_status = ApprovalStatus.APPROVED;
    loan.approved_at = new Date();
    loan.approved_by = approvedBy;

    await this.loanRepository.save(loan);

    const equipment = await this.equipmentRepository.findOne({
      where: { id: loan.equipment_id },
    });
    if (equipment) {
      equipment.status = EquipmentStatus.LOANED;
      await this.equipmentRepository.save(equipment);
    }

    await this.createAuditLog(
      approvedBy,
      AuditAction.LOAN_APPROVED,
      'loan',
      loan.id,
      JSON.stringify({ approved_at: loan.approved_at }),
    );

    this.logger.log(`Préstamo aprobado: ${id} por ${approvedBy}`);
    return this.findById(id);
  }

  async reject(id: string, rejectedBy: string): Promise<Loan> {
    const loan = await this.findById(id);

    if (loan.approval_status !== ApprovalStatus.PENDING) {
      throw new BadRequestException('Solo se pueden rechazar préstamos pendientes');
    }

    loan.approval_status = ApprovalStatus.REJECTED;
    loan.status = LoanStatus.CANCELLED;
    loan.approved_at = new Date();
    loan.approved_by = rejectedBy;

    await this.loanRepository.save(loan);

    await this.createAuditLog(
      rejectedBy,
      AuditAction.LOAN_REJECTED,
      'loan',
      loan.id,
      JSON.stringify({ rejected_at: loan.approved_at }),
    );

    this.logger.log(`Préstamo rechazado: ${id} por ${rejectedBy}`);
    return this.findById(id);
  }

  async return(id: string, returnedBy?: string): Promise<Loan> {
    const loan = await this.findById(id);

    if (loan.status === LoanStatus.RETURNED) {
      throw new BadRequestException('Este préstamo ya fue devuelto');
    }

    if (loan.status === LoanStatus.CANCELLED) {
      throw new BadRequestException('No se puede devolver un préstamo cancelado');
    }

    loan.status = LoanStatus.RETURNED;
    loan.return_date = new Date();

    await this.loanRepository.save(loan);

    const equipment = await this.equipmentRepository.findOne({
      where: { id: loan.equipment_id },
    });
    if (equipment) {
      equipment.status = EquipmentStatus.AVAILABLE;
      await this.equipmentRepository.save(equipment);
    }

    await this.createAuditLog(
      returnedBy || loan.collaborator_id,
      AuditAction.LOAN_RETURNED,
      'loan',
      loan.id,
      JSON.stringify({ return_date: loan.return_date }),
    );

    this.logger.log(`Devolución registrada: ${id}`);
    return this.findById(id);
  }

  async cancel(id: string, userId: string, isManager: boolean): Promise<Loan> {
    const loan = await this.findById(id);

    if (loan.approval_status === ApprovalStatus.APPROVED && !isManager) {
      throw new ForbiddenException('Solo un administrador puede cancelar un préstamo aprobado');
    }

    if (loan.status === LoanStatus.RETURNED) {
      throw new BadRequestException('No se puede cancelar un préstamo ya devuelto');
    }

    if (loan.status === LoanStatus.CANCELLED) {
      throw new BadRequestException('Este préstamo ya fue cancelado');
    }

    loan.status = LoanStatus.CANCELLED;
    if (loan.approval_status === ApprovalStatus.PENDING) {
      loan.approval_status = ApprovalStatus.REJECTED;
    }

    if (loan.approval_status === ApprovalStatus.APPROVED) {
      const equipment = await this.equipmentRepository.findOne({
        where: { id: loan.equipment_id },
      });
      if (equipment && equipment.status === EquipmentStatus.LOANED) {
        equipment.status = EquipmentStatus.AVAILABLE;
        await this.equipmentRepository.save(equipment);
      }
    }

    await this.loanRepository.save(loan);

    await this.createAuditLog(
      userId,
      AuditAction.LOAN_CANCELLED,
      'loan',
      loan.id,
      JSON.stringify({ cancelled_at: new Date() }),
    );

    this.logger.log(`Préstamo cancelado: ${id} por ${userId}`);
    return this.findById(id);
  }

  async getAuditLogsForLoan(loanId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entity_type: 'loan', entity_id: loanId },
      order: { timestamp: 'DESC' },
    });
  }

  async updateOverdueLoans(): Promise<number> {
    const now = new Date();
    const result = await this.loanRepository.update(
      {
        status: LoanStatus.ACTIVE,
        approval_status: ApprovalStatus.APPROVED,
        due_date: LessThan(now),
      },
      { status: LoanStatus.OVERDUE },
    );
    return result.affected || 0;
  }

  private async createAuditLog(
    userId: string,
    action: AuditAction,
    entityType: string,
    entityId: string,
    details?: string,
  ): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      id: generateUUID(),
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      timestamp: new Date(),
      details,
    });

    return this.auditLogRepository.save(auditLog);
  }
}