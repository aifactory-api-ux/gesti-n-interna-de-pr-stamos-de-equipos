import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AzureStrategy } from './azure.strategy';
import { AzureAuthGuard } from './auth.guard';
import { Collaborator } from '../../entities/collaborator.entity';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'azure' }),
    TypeOrmModule.forFeature([Collaborator]),
  ],
  controllers: [AuthController],
  providers: [AuthService, AzureStrategy, AzureAuthGuard],
  exports: [AuthService, AzureAuthGuard],
})
export class AuthModule {}
