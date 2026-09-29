import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Equipment } from '../../entities/equipment.entity';
import { EquipmentStatus } from '../../enums';
import { PaginationResult } from '../../types';
import { generateUUID } from '../../common/utils/uuid';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { EquipmentFiltersDto } from './dto/equipment-filters.dto';

@Injectable()
export class EquipmentService {
  private readonly logger = new Logger(EquipmentService.name);

  constructor(
    @InjectRepository(Equipment)
    private readonly equipmentRepository: Repository<Equipment>,
  ) {}

  async findAll(filters: EquipmentFiltersDto): Promise<PaginationResult<Equipment>> {
    const { page = 1, limit = 10, type, status, search, sort_by, order = 'ASC' } = filters;

    const where: FindOptionsWhere<Equipment> = {};

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.name = Like(`%${search}%`);
    }

    let orderConfig: Record<string, 'ASC' | 'DESC'> = { name: 'ASC' };

    if (sort_by === 'availability') {
      orderConfig = { status: order };
    } else if (sort_by) {
      orderConfig = { [sort_by]: order };
    }

    const [data, total] = await this.equipmentRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: orderConfig,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
    });

    if (!equipment) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    return equipment;
  }

  async create(createDto: CreateEquipmentDto): Promise<Equipment> {
    const equipment = this.equipmentRepository.create({
      id: generateUUID(),
      name: createDto.name,
      type: createDto.type,
      status: EquipmentStatus.AVAILABLE,
      serial_number: createDto.serial_number || null,
    });

    const saved = await this.equipmentRepository.save(equipment);
    this.logger.log(`Equipo creado: ${saved.id} - ${saved.name}`);
    return saved;
  }

  async update(id: string, updateDto: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await this.findById(id);

    if (updateDto.name !== undefined) {
      equipment.name = updateDto.name;
    }

    if (updateDto.type !== undefined) {
      equipment.type = updateDto.type;
    }

    if (updateDto.status !== undefined) {
      equipment.status = updateDto.status;
    }

    if (updateDto.serial_number !== undefined) {
      equipment.serial_number = updateDto.serial_number;
    }

    const updated = await this.equipmentRepository.save(equipment);
    this.logger.log(`Equipo actualizado: ${updated.id}`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const equipment = await this.findById(id);
    await this.equipmentRepository.remove(equipment);
    this.logger.log(`Equipo eliminado: ${id}`);
  }

  async getTypes(): Promise<string[]> {
    return Object.values([
      'notebook',
      'monitor',
      'keyboard',
      'mouse',
      'headset',
      'cable',
      'adapter',
      'other',
    ]);
  }

  async updateStatus(id: string, status: EquipmentStatus): Promise<Equipment> {
    const equipment = await this.findById(id);
    equipment.status = status;
    return this.equipmentRepository.save(equipment);
  }
}
