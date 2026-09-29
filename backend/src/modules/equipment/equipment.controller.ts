import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentFiltersDto } from './dto/equipment-filters.dto';
import { AzureAuthGuard } from '../auth/auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('equipment')
@UseGuards(AzureAuthGuard)
export class EquipmentController {
  private readonly logger = new Logger(EquipmentController.name);

  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findAll(@Query() filters: EquipmentFiltersDto) {
    return this.equipmentService.findAll(filters);
  }

  @Get('types')
  async getTypes(): Promise<string[]> {
    return this.equipmentService.getTypes();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.equipmentService.findById(id);
  }

  @Post()
  @Roles('manager')
  async create(@Body() createDto: CreateEquipmentDto) {
    this.logger.log(`Creando equipo: ${createDto.name}`);
    return this.equipmentService.create(createDto);
  }

  @Patch(':id')
  @Roles('manager')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEquipmentDto,
  ) {
    this.logger.log(`Actualizando equipo: ${id}`);
    return this.equipmentService.update(id, updateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('manager')
  async delete(@Param('id') id: string) {
    this.logger.log(`Eliminando equipo: ${id}`);
    await this.equipmentService.delete(id);
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('manager')
  async deleteByBody(@Body('id') id: string) {
    if (!id) {
      throw new BadRequestException('ID es requerido');
    }
    this.logger.log(`Eliminando equipo por body: ${id}`);
    await this.equipmentService.delete(id);
  }
}
