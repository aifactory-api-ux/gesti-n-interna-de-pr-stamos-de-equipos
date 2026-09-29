import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Collaborator } from '../../entities/collaborator.entity';
import { PaginationResult } from '../../types';
import { CollaboratorFiltersDto } from './dto/collaborator-filters.dto';

@Injectable()
export class CollaboratorService {
  private readonly logger = new Logger(CollaboratorService.name);

  constructor(
    @InjectRepository(Collaborator)
    private readonly collaboratorRepository: Repository<Collaborator>,
  ) {}

  async findAll(filters: CollaboratorFiltersDto): Promise<PaginationResult<Collaborator>> {
    const { page = 1, limit = 10, search, email } = filters;

    const where: FindOptionsWhere<Collaborator> = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (email) {
      where.email = email;
    }

    const [data, total] = await this.collaboratorRepository.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { name: 'ASC' },
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<Collaborator> {
    const collaborator = await this.collaboratorRepository.findOne({
      where: { id },
    });

    if (!collaborator) {
      throw new NotFoundException(`Colaborador con ID ${id} no encontrado`);
    }

    return collaborator;
  }

  async findByEmail(email: string): Promise<Collaborator | null> {
    return this.collaboratorRepository.findOne({
      where: { email },
    });
  }

  async findByAzureAdId(azureAdId: string): Promise<Collaborator | null> {
    return this.collaboratorRepository.findOne({
      where: { azure_ad_id: azureAdId },
    });
  }

  async createOrUpdate(data: {
    azure_ad_id?: string;
    name: string;
    email: string;
  }): Promise<Collaborator> {
    let collaborator = await this.findByEmail(data.email);

    if (collaborator) {
      collaborator.name = data.name;
      if (data.azure_ad_id) {
        collaborator.azure_ad_id = data.azure_ad_id;
      }
      return this.collaboratorRepository.save(collaborator);
    }

    collaborator = this.collaboratorRepository.create({
      id: crypto.randomUUID(),
      azure_ad_id: data.azure_ad_id || null,
      name: data.name,
      email: data.email,
    });

    const saved = await this.collaboratorRepository.save(collaborator);
    this.logger.log(`Colaborador creado/actualizado: ${saved.id} - ${saved.email}`);
    return saved;
  }

  async findMe(userId: string): Promise<Collaborator> {
    return this.findById(userId);
  }
}