import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PatientPhaseStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreatePhaseVersionDto,
  UpdateClinicalHistoryDto,
} from './dto/phase-version.dto';

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

@Injectable()
export class ClinicalHistoriesService {
  constructor(private prisma: PrismaService) {}

  async getByPatient(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        patientType: true,
        professional: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    let history = await this.prisma.clinicalHistory.findUnique({
      where: { patientId },
      include: {
        phases: {
          include: {
            phaseTemplate: {
              include: {
                items: {
                  where: { active: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
            versions: {
              where: { isCurrent: true },
              include: {
                itemScores: {
                  include: { phaseItemTemplate: true },
                },
                createdBy: { select: { id: true, email: true } },
              },
              take: 1,
            },
          },
          orderBy: { phaseTemplate: { sortOrder: 'asc' } },
        },
      },
    });

    if (!history) {
      history = await this.ensureHistory(patientId);
    }

    const completedScores = history.phases
      .filter((p) => p.versions[0])
      .map((p) => p.versions[0].score);

    const globalScore =
      completedScores.length > 0
        ? round1(
            completedScores.reduce((a, b) => a + b, 0) / completedScores.length,
          )
        : null;

    return {
      patient,
      clinicalHistoryId: history.id,
      historyDate: history.historyDate,
      globalScore,
      phases: history.phases.map((phase) => ({
        id: phase.id,
        status: phase.status,
        phaseTemplate: phase.phaseTemplate,
        currentVersion: phase.versions[0] ?? null,
      })),
    };
  }

  async updateHistoryDate(patientId: string, dto: UpdateClinicalHistoryDto) {
    const history = await this.prisma.clinicalHistory.findUnique({
      where: { patientId },
    });
    if (!history) throw new NotFoundException('Historia clínica no encontrada');

    return this.prisma.clinicalHistory.update({
      where: { id: history.id },
      data: { historyDate: new Date(dto.historyDate) },
    });
  }

  async getPhaseVersions(patientId: string, patientPhaseId: string) {
    await this.getPatientPhase(patientId, patientPhaseId);
    return this.prisma.patientPhaseVersion.findMany({
      where: { patientPhaseId },
      include: {
        itemScores: { include: { phaseItemTemplate: true } },
        createdBy: { select: { id: true, email: true } },
      },
      orderBy: [{ evaluationDate: 'desc' }, { versionNumber: 'desc' }],
    });
  }

  async createVersion(
    patientId: string,
    patientPhaseId: string,
    userId: string,
    dto: CreatePhaseVersionDto,
  ) {
    const phase = await this.getPatientPhase(patientId, patientPhaseId);

    const current = await this.prisma.patientPhaseVersion.findFirst({
      where: { patientPhaseId, isCurrent: true },
    });

    if (
      current &&
      (!dto.clarificationNote || dto.clarificationNote.trim().length < 5)
    ) {
      throw new BadRequestException(
        'Para editar una fase ya evaluada debe indicar una nota aclaratoria (mín. 5 caracteres)',
      );
    }

    const scores = dto.itemScores.map((i) => i.score);
    if (scores.some((s) => s < 1 || s > 5)) {
      throw new BadRequestException(
        'Las calificaciones deben estar entre 1 y 5',
      );
    }
    const phaseScore = round1(
      scores.reduce((a, b) => a + b, 0) / scores.length,
    );

    const nextVersion = current ? current.versionNumber + 1 : 1;

    return this.prisma.$transaction(async (tx) => {
      if (current) {
        await tx.patientPhaseVersion.update({
          where: { id: current.id },
          data: { isCurrent: false },
        });
      }

      const version = await tx.patientPhaseVersion.create({
        data: {
          patientPhaseId,
          versionNumber: nextVersion,
          isCurrent: true,
          score: phaseScore,
          evaluationDate: new Date(dto.evaluationDate),
          notes: dto.notes,
          clarificationNote: current ? dto.clarificationNote : null,
          createdById: userId,
          itemScores: {
            create: dto.itemScores.map((item) => ({
              phaseItemTemplateId: item.phaseItemTemplateId,
              score: item.score,
            })),
          },
        },
        include: {
          itemScores: { include: { phaseItemTemplate: true } },
          createdBy: { select: { id: true, email: true } },
        },
      });

      await tx.patientPhase.update({
        where: { id: phase.id },
        data: { status: PatientPhaseStatus.COMPLETED },
      });

      return version;
    });
  }

  private async getPatientPhase(patientId: string, patientPhaseId: string) {
    const history = await this.prisma.clinicalHistory.findUnique({
      where: { patientId },
    });
    if (!history) throw new NotFoundException('Historia clínica no encontrada');

    const phase = await this.prisma.patientPhase.findFirst({
      where: { id: patientPhaseId, clinicalHistoryId: history.id },
      include: { phaseTemplate: { include: { items: true } } },
    });
    if (!phase) throw new NotFoundException('Fase del paciente no encontrada');
    return phase;
  }

  private async ensureHistory(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    const phaseTemplates = await this.prisma.phaseTemplate.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });

    const history = await this.prisma.clinicalHistory.create({
      data: {
        patientId,
        historyDate: patient?.centerEntryDate ?? new Date(),
        phases: {
          create: phaseTemplates.map((p) => ({
            phaseTemplateId: p.id,
          })),
        },
      },
      include: {
        phases: {
          include: {
            phaseTemplate: {
              include: {
                items: {
                  where: { active: true },
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
            versions: {
              where: { isCurrent: true },
              include: {
                itemScores: {
                  include: { phaseItemTemplate: true },
                },
                createdBy: { select: { id: true, email: true } },
              },
              take: 1,
            },
          },
          orderBy: { phaseTemplate: { sortOrder: 'asc' } },
        },
      },
    });

    return history;
  }
}
