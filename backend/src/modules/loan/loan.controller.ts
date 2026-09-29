import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { AzureAuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../types';
import { LoanService } from './loan.service';
import { CreateLoanDto } from './dto/create-loan.dto';
import { ApproveLoanDto } from './dto/approve-loan.dto';
import { ReturnLoanDto } from './dto/return-loan.dto';
import { LoanFiltersDto } from './dto/loan-filters.dto';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('loans')
@UseGuards(AzureAuthGuard)
export class LoanController {
  private readonly logger = new Logger(LoanController.name);

  constructor(private readonly loanService: LoanService) {}

  @Get()
  async findAll(
    @CurrentUser() user: AuthUser,
    @Query() filters: LoanFiltersDto,
  ) {
    this.logger.log(`Usuario ${user.email} listando préstamos`);
    return this.loanService.findAll(filters, user.id, user.is_manager);
  }

  @Get('my')
  async findMyLoans(@CurrentUser() user: AuthUser) {
    this.logger.log(`Usuario ${user.email} listando sus préstamos`);
    return this.loanService.findMyLoans(user.id);
  }

  @Get('pending')
  @Roles('manager')
  async findPendingLoans(@Query() filters: LoanFiltersDto) {
    this.logger.log(`Listando préstamos pendientes`);
    return this.loanService.findPendingLoans(filters);
  }

  @Get('overdue')
  @Roles('manager')
  async findOverdueLoans(@Query() filters: LoanFiltersDto) {
    this.logger.log(`Listando préstamos vencidos`);
    return this.loanService.findOverdueLoans(filters);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.loanService.findById(id);
  }

  @Post()
  async create(
    @CurrentUser() user: AuthUser,
    @Body() createDto: CreateLoanDto,
  ) {
    this.logger.log(`Usuario ${user.email} creando préstamo`);
    return this.loanService.create(user.id, createDto);
  }

  @Post(':id/approve')
  @Roles('manager')
  async approve(
    @Param('id') id: string,
    @Body() approveDto: ApproveLoanDto,
  ) {
    this.logger.log(`Aprobando préstamo ${id}`);
    return this.loanService.approve(id, approveDto.approved_by);
  }

  @Post(':id/reject')
  @Roles('manager')
  async reject(
    @Param('id') id: string,
    @Body() approveDto: ApproveLoanDto,
  ) {
    this.logger.log(`Rechazando préstamo ${id}`);
    return this.loanService.reject(id, approveDto.approved_by);
  }

  @Post(':id/return')
  @Roles('manager')
  async returnLoan(
    @Param('id') id: string,
    @Body() returnDto: ReturnLoanDto,
  ) {
    this.logger.log(`Registrando devolución de préstamo ${id}`);
    return this.loanService.return(id, returnDto.returned_by);
  }

  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    this.logger.log(`Cancelando préstamo ${id}`);
    return this.loanService.cancel(id, user.id, user.is_manager);
  }
}
