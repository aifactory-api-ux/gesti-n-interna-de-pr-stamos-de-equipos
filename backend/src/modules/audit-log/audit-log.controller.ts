import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AuditLogService } from './audit-log.service';
import { AuditLogFiltersDto } from './dto/audit-log-filters.dto';
import { AzureAuthGuard } from '../auth/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('audit-logs')
@UseGuards(AzureAuthGuard)
export class AuditLogController {
  private readonly logger = new Logger(AuditLogController.name);

  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  @Roles('manager')
  async findAll(@Query() filters: AuditLogFiltersDto) {
    return this.auditLogService.findAll(filters);
  }

  @Get('loan/:loanId')
  async findByLoanId(@Param('loanId') loanId: string) {
    return this.auditLogService.findByLoanId(loanId);
  }

  @Get(':id')
  @Roles('manager')
  async findById(@Param('id') id: string) {
    return this.auditLogService.findById(id);
  }
}