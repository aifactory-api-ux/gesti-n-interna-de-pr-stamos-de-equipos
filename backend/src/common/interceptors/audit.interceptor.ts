import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../entities/audit-log.entity';
import { AuditAction } from '../../enums';
import { generateUUID } from '../utils/uuid';

export const AUDIT_ACTION_KEY = 'auditAction';
export const AUDIT_ENTITY_TYPE_KEY = 'auditEntityType';
export const AUDIT_ENTITY_ID_KEY = 'auditEntityId';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const auditAction = this.getAuditAction(context);
    const auditEntityType = this.getAuditEntityType(context);
    const auditEntityId = this.getAuditEntityId(context, request);

    if (!auditAction || !auditEntityType) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          const entityId = auditEntityId || (responseData?.id as string) || 'unknown';

          const auditLog = this.auditLogRepository.create({
            id: generateUUID(),
            user_id: user?.id || 'system',
            action: auditAction,
            entity_type: auditEntityType,
            entity_id: entityId,
            timestamp: new Date(),
            details: this.buildDetails(request, responseData, auditAction),
          });

          await this.auditLogRepository.save(auditLog);
          this.logger.log(
            `Auditoría: ${auditAction} en ${auditEntityType}:${entityId} por usuario ${user?.id || 'system'}`,
          );
        } catch (error) {
          this.logger.error(`Error al guardar auditoría: ${error.message}`, error.stack);
        }
      }),
    );
  }

  private getAuditAction(context: ExecutionContext): string | null {
    const handler = context.getHandler();
    const controller = context.getClass();

    const handlerAudit = Reflect.getMetadata(AUDIT_ACTION_KEY, handler);
    if (handlerAudit) {
      return handlerAudit;
    }

    const controllerAudit = Reflect.getMetadata(AUDIT_ACTION_KEY, controller);
    return controllerAudit || null;
  }

  private getAuditEntityType(context: ExecutionContext): string | null {
    const handler = context.getHandler();
    const controller = context.getClass();

    const handlerEntity = Reflect.getMetadata(AUDIT_ENTITY_TYPE_KEY, handler);
    if (handlerEntity) {
      return handlerEntity;
    }

    const controllerEntity = Reflect.getMetadata(AUDIT_ENTITY_TYPE_KEY, controller);
    return controllerEntity || 'loan';
  }

  private getAuditEntityId(context: ExecutionContext, request: any): string | null {
    const handler = context.getHandler();
    const handlerEntityId = Reflect.getMetadata(AUDIT_ENTITY_ID_KEY, handler);
    if (handlerEntityId) {
      const id = request.params[handlerEntityId];
      return id || null;
    }
    return request.params.id || null;
  }

  private buildDetails(
    request: any,
    responseData: unknown,
    action: string,
  ): string {
    const details: Record<string, unknown> = {
      method: request.method,
      path: request.url,
      action: action,
    };

    if (request.body && Object.keys(request.body).length > 0) {
      const body = { ...request.body };
      if (body.approved_by) {
        body.approved_by = '[REDACTED]';
      }
      details.body = body;
    }

    if (responseData) {
      details.response_id = (responseData as any)?.id;
    }

    return JSON.stringify(details);
  }
}