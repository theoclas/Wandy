import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PatientPhaseStatus,
  PhaseUnlockMode,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  UpdateClinicalHistoryDto,
  UpdateCriterionScoreDto,
} from './dto/phase-version.dto';

export const APPROVAL_THRESHOLD = 3;

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return round2(values.reduce((a, b) => a + b, 0) / values.length);
}

const historyInclude = {
  phases: {
    include: {
      phaseTemplate: true,
      subgroups: {
        include: {
          subgroupTemplate: true,
          criterionScores: {
            include: { criterionTemplate: true },
            orderBy: { criterionTemplate: { sortOrder: 'asc' as const } },
          },
        },
        orderBy: { subgroupTemplate: { sortOrder: 'asc' as const } },
      },
    },
    orderBy: { phaseTemplate: { sortOrder: 'asc' as const } },
  },
} satisfies Prisma.ClinicalHistoryInclude;

type FullHistory = Prisma.ClinicalHistoryGetPayload<{
  include: typeof historyInclude;
}>;

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
      include: historyInclude,
    });

    if (!history) {
      history = await this.ensureHistory(patientId);
    } else if (this.needsRematerialize(history)) {
      await this.materializeMissing(history.id);
      history = await this.prisma.clinicalHistory.findUniqueOrThrow({
        where: { id: history.id },
        include: historyInclude,
      });
    }

    return this.toView(patient, history);
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

  async getCriterionHistory(patientId: string, criterionScoreId: string) {
    const score = await this.findCriterionScore(patientId, criterionScoreId);
    return this.prisma.scoreChangeLog.findMany({
      where: { patientCriterionScoreId: score.id },
      include: {
        changedBy: { select: { id: true, email: true, role: true } },
      },
      orderBy: { changedAt: 'desc' },
    });
  }

  async updateCriterionScore(
    patientId: string,
    criterionScoreId: string,
    userId: string,
    dto: UpdateCriterionScoreDto,
  ) {
    const score = await this.findCriterionScore(patientId, criterionScoreId);
    const view = await this.getByPatient(patientId);
    const phaseView = view.phases.find((p) =>
      p.subgroups.some((sg) =>
        sg.criteria.some((c) => c.id === criterionScoreId),
      ),
    );
    if (!phaseView) throw new NotFoundException('Criterio no encontrado');
    if (!phaseView.unlocked) {
      throw new BadRequestException(
        'Esta fase está bloqueada. Debe aprobar la fase anterior (promedio > 3).',
      );
    }

    const subgroupView = phaseView.subgroups.find((sg) =>
      sg.criteria.some((c) => c.id === criterionScoreId),
    );
    if (!subgroupView?.unlocked) {
      throw new BadRequestException(
        'Este grupo/subfase está bloqueado. Debe aprobar el anterior (promedio > 3).',
      );
    }

    const next = round2(dto.score);
    if (next < 0 || next > 5) {
      throw new BadRequestException('La calificación debe estar entre 0 y 5');
    }

    const previous = score.score;
    if (previous === next) {
      return this.getByPatient(patientId);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.patientCriterionScore.update({
        where: { id: score.id },
        data: { score: next },
      });
      await tx.scoreChangeLog.create({
        data: {
          patientCriterionScoreId: score.id,
          previousScore: previous,
          newScore: next,
          changedById: userId,
        },
      });

      const patientPhaseId = score.patientSubgroup.patientPhaseId;
      const phaseScores = await tx.patientCriterionScore.findMany({
        where: { patientSubgroup: { patientPhaseId } },
      });
      const avg = average(phaseScores.map((s) => s.score));
      let status: PatientPhaseStatus = PatientPhaseStatus.PENDING;
      if (avg > 0 && avg <= APPROVAL_THRESHOLD) {
        status = PatientPhaseStatus.IN_PROGRESS;
      }
      if (avg > APPROVAL_THRESHOLD) {
        status = PatientPhaseStatus.COMPLETED;
      }
      await tx.patientPhase.update({
        where: { id: patientPhaseId },
        data: { status },
      });
    });

    return this.getByPatient(patientId);
  }

  private async findCriterionScore(patientId: string, criterionScoreId: string) {
    const score = await this.prisma.patientCriterionScore.findUnique({
      where: { id: criterionScoreId },
      include: {
        patientSubgroup: {
          include: {
            patientPhase: {
              include: { clinicalHistory: true },
            },
          },
        },
      },
    });
    if (
      !score ||
      score.patientSubgroup.patientPhase.clinicalHistory.patientId !== patientId
    ) {
      throw new NotFoundException('Calificación de criterio no encontrada');
    }
    return score;
  }

  private toView(
    patient: {
      id: string;
      firstName: string;
      lastName: string;
      document: string;
      phone: string | null;
      email: string | null;
      address: string | null;
      gender: string;
      birthDate: Date;
      systemEntryDate: Date;
      centerEntryDate: Date;
      patientTypeId: string;
      professionalId: string | null;
      patientType: unknown;
      professional: unknown;
    },
    history: FullHistory,
  ) {
    const phaseAverages: number[] = [];
    const phases = history.phases.map((phase, index) => {
      const prevApproved =
        index === 0 || phaseAverages[index - 1] > APPROVAL_THRESHOLD;
      const phaseUnlocked = prevApproved;

      const subgroupAvgs = new Map<string, number>();
      for (const sg of phase.subgroups) {
        const scores = sg.criterionScores.map((c) => c.score);
        subgroupAvgs.set(sg.id, average(scores));
      }

      const phaseScore = average([...subgroupAvgs.values()]);
      phaseAverages.push(phaseScore);

      const unlockMode = phase.phaseTemplate.unlockMode;
      const ranked = [...phase.subgroups].sort(
        (a, b) =>
          a.subgroupTemplate.unlockRank - b.subgroupTemplate.unlockRank,
      );

      const subgroups = phase.subgroups.map((sg) => {
        const score = subgroupAvgs.get(sg.id) ?? 0;
        const approved = score > APPROVAL_THRESHOLD;
        let unlocked = phaseUnlocked;
        if (phaseUnlocked && unlockMode === PhaseUnlockMode.SEQUENTIAL) {
          const rank = sg.subgroupTemplate.unlockRank;
          unlocked = ranked
            .filter((r) => r.subgroupTemplate.unlockRank < rank)
            .every((r) => (subgroupAvgs.get(r.id) ?? 0) > APPROVAL_THRESHOLD);
        }

        return {
          id: sg.id,
          score,
          approved,
          unlocked,
          subgroupTemplate: {
            id: sg.subgroupTemplate.id,
            sortOrder: sg.subgroupTemplate.sortOrder,
            unlockRank: sg.subgroupTemplate.unlockRank,
            name: sg.subgroupTemplate.name,
            purpose: sg.subgroupTemplate.purpose,
            hideInUi: sg.subgroupTemplate.hideInUi,
          },
          criteria: sg.criterionScores.map((c) => ({
            id: c.id,
            score: c.score,
            criterionTemplate: {
              id: c.criterionTemplate.id,
              sortOrder: c.criterionTemplate.sortOrder,
              label: c.criterionTemplate.label,
            },
          })),
        };
      });

      const approved = phaseScore > APPROVAL_THRESHOLD;

      return {
        id: phase.id,
        status: phase.status,
        score: phaseScore,
        approved,
        unlocked: phaseUnlocked,
        phaseTemplate: {
          id: phase.phaseTemplate.id,
          sortOrder: phase.phaseTemplate.sortOrder,
          name: phase.phaseTemplate.name,
          description: phase.phaseTemplate.description,
          unlockMode: phase.phaseTemplate.unlockMode,
        },
        subgroups,
      };
    });

    const globalScore = phases.length
      ? average(phases.map((p) => p.score))
      : 0;

    return {
      patient,
      clinicalHistoryId: history.id,
      historyDate: history.historyDate,
      globalScore,
      approvalThreshold: APPROVAL_THRESHOLD,
      phases,
    };
  }

  private needsRematerialize(history: FullHistory) {
    return history.phases.some(
      (p) =>
        p.subgroups.length === 0 ||
        p.subgroups.some((sg) => sg.criterionScores.length === 0),
    );
  }

  private async materializeMissing(clinicalHistoryId: string) {
    const templates = await this.prisma.phaseTemplate.findMany({
      where: { active: true },
      include: {
        subgroups: {
          where: { active: true },
          include: {
            criteria: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    for (const template of templates) {
      let patientPhase = await this.prisma.patientPhase.findUnique({
        where: {
          clinicalHistoryId_phaseTemplateId: {
            clinicalHistoryId,
            phaseTemplateId: template.id,
          },
        },
      });
      if (!patientPhase) {
        patientPhase = await this.prisma.patientPhase.create({
          data: { clinicalHistoryId, phaseTemplateId: template.id },
        });
      }

      for (const sg of template.subgroups) {
        let patientSubgroup = await this.prisma.patientSubgroup.findUnique({
          where: {
            patientPhaseId_subgroupTemplateId: {
              patientPhaseId: patientPhase.id,
              subgroupTemplateId: sg.id,
            },
          },
        });
        if (!patientSubgroup) {
          patientSubgroup = await this.prisma.patientSubgroup.create({
            data: {
              patientPhaseId: patientPhase.id,
              subgroupTemplateId: sg.id,
            },
          });
        }

        for (const criterion of sg.criteria) {
          await this.prisma.patientCriterionScore.upsert({
            where: {
              patientSubgroupId_criterionTemplateId: {
                patientSubgroupId: patientSubgroup.id,
                criterionTemplateId: criterion.id,
              },
            },
            update: {},
            create: {
              patientSubgroupId: patientSubgroup.id,
              criterionTemplateId: criterion.id,
              score: 0,
            },
          });
        }
      }
    }
  }

  async ensureHistory(patientId: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: patientId },
    });
    if (!patient) throw new NotFoundException('Paciente no encontrado');

    const templates = await this.prisma.phaseTemplate.findMany({
      where: { active: true },
      include: {
        subgroups: {
          where: { active: true },
          include: {
            criteria: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
          },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    const history = await this.prisma.clinicalHistory.create({
      data: {
        patientId,
        historyDate: patient.centerEntryDate,
        phases: {
          create: templates.map((phase) => ({
            phaseTemplateId: phase.id,
            subgroups: {
              create: phase.subgroups.map((sg) => ({
                subgroupTemplateId: sg.id,
                criterionScores: {
                  create: sg.criteria.map((c) => ({
                    criterionTemplateId: c.id,
                    score: 0,
                  })),
                },
              })),
            },
          })),
        },
      },
      include: historyInclude,
    });

    return history;
  }
}
