import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { EquipmentModule } from './modules/equipment/equipment.module';
import { LoanModule } from './modules/loan/loan.module';
import { HealthModule } from './modules/health/health.module';
import { CollaboratorModule } from './modules/collaborator/collaborator.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { ManagerModule } from './modules/manager/manager.module';
import { Collaborator } from './entities/collaborator.entity';
import { Equipment } from './entities/equipment.entity';
import { Loan } from './entities/loan.entity';
import { AuditLog } from './entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig()),
    TypeOrmModule.forFeature([Collaborator, Equipment, Loan, AuditLog]),
    AuthModule,
    EquipmentModule,
    LoanModule,
    HealthModule,
    CollaboratorModule,
    AuditLogModule,
    ManagerModule,
  ],
})
export class AppModule {}
