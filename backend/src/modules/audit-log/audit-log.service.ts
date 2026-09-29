import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { PaginationResult } from '../../types';
import { AuditLogFiltersDto } from './dto/audit-log-filters.dto';

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async findAll(filters: AuditLogFiltersDto): Promise<PaginationResult<AuditLog>> {
    const { page = 1, limit = 10, entity_type, entity_id, user_id, action, start_date, end_date } = filters;

    const where: FindOptionsWhere<AuditLog> = {};

    if (entity_type) {
      where.entity_type = entity_type;
    }

    if (entity_id) {
      where.entity_id = entity_id;
    }

    if (user_id) {
      where.user_id = user_id;
    }

    if (action) {
      where.action = action;
    }

    if (start_date && end_date) {
      where.timestamp = Between(start_date, end_date);
    } else if (start_date) {
      where.timestamp = MoreThanOrEqual(start_date);
    } else if (end_date) {
      where.timestamp = LessThanOrEqual(end_date);
    }

    const [data, total] = await this.auditLogRepository.findAndCount({
      where,
      relations: ['user'],
      skip: (page - 1) * limit,
      take: limit,
      order: { timestamp: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<AuditLog> {
    const auditLog = await this.auditLogRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!auditLog) {
      throw new NotFoundException(`Registro de auditoría con ID ${id} no encontrado`);
    }

    return auditLog;
  }

  async findByLoanId(loanId: string): Promise<AuditLog[]> {
    return this.auditLogRepository.find({
      where: { entity_type: 'loan', entity_id: loanId },
      relations: ['user'],
      order: { timestamp: 'DESC' },
    });
  }

  async create(data: {
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    details?: string;
  }): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      id: crypto.randomUUID(),
      user_id: data.user_id,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      timestamp: new Date(),
      details: data.details || null,
    });

    const saved = await this.auditLogRepository.save(auditLog);
    this.logger.log(`Audit log creado: ${saved.id} - ${saved.action}`);
    return saved;
  }
}