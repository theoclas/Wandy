import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePhaseItemDto,
  CreatePhaseTemplateDto,
  UpdatePhaseItemDto,
  UpdatePhaseTemplateDto,
} from './dto/phase-template.dto';

@Injectable()
export class PhaseTemplatesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.phaseTemplate.findMany({
      include: {
        items: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.phaseTemplate.findUnique({
      where: { id },
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
    if (!item) throw new NotFoundException('Fase no encontrada');
    return item;
  }

  async create(dto: CreatePhaseTemplateDto) {
    const phase = await this.prisma.phaseTemplate.create({
      data: dto,
      include: { items: true },
    });

    const histories = await this.prisma.clinicalHistory.findMany({
      select: { id: true },
    });
    if (histories.length) {
      await this.prisma.patientPhase.createMany({
        data: histories.map((h) => ({
          clinicalHistoryId: h.id,
          phaseTemplateId: phase.id,
        })),
        skipDuplicates: true,
      });
    }

    return phase;
  }

  async update(id: string, dto: UpdatePhaseTemplateDto) {
    await this.findOne(id);
    return this.prisma.phaseTemplate.update({
      where: { id },
      data: dto,
      include: {
        items: { orderBy: { sortOrder: 'asc' } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.phaseTemplate.delete({ where: { id } });
    return { deleted: true };
  }

  async addItem(phaseId: string, dto: CreatePhaseItemDto) {
    await this.findOne(phaseId);
    return this.prisma.phaseItemTemplate.create({
      data: { ...dto, phaseTemplateId: phaseId },
    });
  }

  async updateItem(itemId: string, dto: UpdatePhaseItemDto) {
    const item = await this.prisma.phaseItemTemplate.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    return this.prisma.phaseItemTemplate.update({
      where: { id: itemId },
      data: dto,
    });
  }

  async removeItem(itemId: string) {
    const item = await this.prisma.phaseItemTemplate.findUnique({
      where: { id: itemId },
    });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    await this.prisma.phaseItemTemplate.delete({ where: { id: itemId } });
    return { deleted: true };
  }
}
