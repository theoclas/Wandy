import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  round2,
  sumWeights,
  weightsSumTo100,
} from '../common/weights';
import { UpdateWeightsDto } from './dto/phase-template.dto';

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

  async updateWeights(dto: UpdateWeightsDto) {
    const phases = await this.prisma.phaseTemplate.findMany({
      where: { active: true },
      include: {
        subgroups: {
          where: { active: true },
          include: {
            criteria: { where: { active: true } },
          },
        },
      },
    });

    const phaseById = new Map(phases.map((p) => [p.id, p]));
    const subgroupById = new Map(
      phases.flatMap((p) => p.subgroups.map((sg) => [sg.id, sg] as const)),
    );
    const criterionById = new Map(
      phases.flatMap((p) =>
        p.subgroups.flatMap((sg) =>
          sg.criteria.map((c) => [c.id, c] as const),
        ),
      ),
    );

    for (const item of dto.phases) {
      if (!phaseById.has(item.id)) {
        throw new BadRequestException(`Fase desconocida: ${item.id}`);
      }
    }
    for (const item of dto.subgroups) {
      if (!subgroupById.has(item.id)) {
        throw new BadRequestException(`Subgrupo desconocido: ${item.id}`);
      }
    }
    for (const item of dto.criteria) {
      if (!criterionById.has(item.id)) {
        throw new BadRequestException(`Criterio desconocido: ${item.id}`);
      }
    }

    if (dto.phases.length !== phases.length) {
      throw new BadRequestException(
        'Debes enviar el peso de todas las fases activas',
      );
    }

    const phaseWeights = dto.phases.map((p) => round2(p.weightPct));
    if (!weightsSumTo100(phaseWeights)) {
      throw new BadRequestException(
        `Los pesos de las fases deben sumar 100% (actual: ${sumWeights(phaseWeights)}%)`,
      );
    }

    for (const phase of phases) {
      const sgItems = dto.subgroups.filter((s) =>
        phase.subgroups.some((sg) => sg.id === s.id),
      );
      if (sgItems.length !== phase.subgroups.length) {
        throw new BadRequestException(
          `Debes enviar el peso de todos los subgrupos de "${phase.name}"`,
        );
      }
      const sgWeights = sgItems.map((s) => round2(s.weightPct));
      if (!weightsSumTo100(sgWeights)) {
        throw new BadRequestException(
          `Los pesos de subgrupos en "${phase.name}" deben sumar 100% (actual: ${sumWeights(sgWeights)}%)`,
        );
      }

      for (const sg of phase.subgroups) {
        const cItems = dto.criteria.filter((c) =>
          sg.criteria.some((cr) => cr.id === c.id),
        );
        if (cItems.length !== sg.criteria.length) {
          throw new BadRequestException(
            `Debes enviar el peso de todos los criterios de "${sg.name}"`,
          );
        }
        const cWeights = cItems.map((c) => round2(c.weightPct));
        if (!weightsSumTo100(cWeights)) {
          throw new BadRequestException(
            `Los pesos de criterios en "${sg.name}" deben sumar 100% (actual: ${sumWeights(cWeights)}%)`,
          );
        }
      }
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of dto.phases) {
        await tx.phaseTemplate.update({
          where: { id: item.id },
          data: { weightPct: round2(item.weightPct) },
        });
      }
      for (const item of dto.subgroups) {
        await tx.subgroupTemplate.update({
          where: { id: item.id },
          data: { weightPct: round2(item.weightPct) },
        });
      }
      for (const item of dto.criteria) {
        await tx.criterionTemplate.update({
          where: { id: item.id },
          data: { weightPct: round2(item.weightPct) },
        });
      }
    });

    return this.findAll();
  }
}
