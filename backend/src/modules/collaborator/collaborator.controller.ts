import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { CollaboratorService } from './collaborator.service';
import { CollaboratorFiltersDto } from './dto/collaborator-filters.dto';
import { AzureAuthGuard } from '../auth/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../types';

@Controller('collaborators')
@UseGuards(AzureAuthGuard)
export class CollaboratorController {
  private readonly logger = new Logger(CollaboratorController.name);

  constructor(private readonly collaboratorService: CollaboratorService) {}

  @Get()
  @Roles('manager')
  async findAll(@Query() filters: CollaboratorFiltersDto) {
    return this.collaboratorService.findAll(filters);
  }

  @Get('me')
  async findMe(@CurrentUser() user: AuthUser) {
    return this.collaboratorService.findMe(user.id);
  }

  @Get(':id')
  @Roles('manager')
  async findById(@Param('id') id: string) {
    return this.collaboratorService.findById(id);
  }
}