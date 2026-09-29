import { Controller, Get, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ManagerService, ManagerStats } from './manager.service';
import { ReportFiltersDto } from './dto/report-filters.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { AzureAuthGuard } from '../auth/auth.guard';

@Controller('manager')
@UseGuards(AzureAuthGuard)
@Roles('manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Get('stats')
  async getStats(): Promise<ManagerStats> {
    return this.managerService.getStats();
  }

  @Get('reports/loans')
  async getLoansReport(@Query() filters: ReportFiltersDto) {
    return this.managerService.getLoansReport(filters);
  }

  @Get('reports/export')
  async exportReport(
    @Query() filters: ReportFiltersDto,
    @Res() res: Response,
  ): Promise<void> {
    const { format = 'csv', data } = await this.managerService.exportReport(filters);

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte-prestamos-${new Date().toISOString().split('T')[0]}.csv`,
      );
      res.send(data);
    } else {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=reporte-prestamos-${new Date().toISOString().split('T')[0]}.pdf`,
      );
      res.send(data);
    }
  }
}
