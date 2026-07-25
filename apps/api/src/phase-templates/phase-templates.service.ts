import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PhaseTemplatesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.phaseTemplate.findMany({
      where: { active: true },
      include: {
        subgroups: {
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            criteria: {
              where: { active: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.phaseTemplate.findUnique({
      where: { id },
      include: {
        subgroups: {
          orderBy: { sortOrder: 'asc' },
          include: {
            criteria: { orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('Fase no encontrada');
    return item;
  }
}
