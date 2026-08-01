import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { APPROVAL_THRESHOLD } from '../clinical-histories/clinical-histories.service';
import { round2, weightedAverage } from '../common/weights';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [patients, professionals, patientTypes, phaseTemplates, histories] =
      await Promise.all([
        this.prisma.patient.count(),
        this.prisma.professional.count({ where: { active: true } }),
        this.prisma.patientType.count({ where: { active: true } }),
        this.prisma.phaseTemplate.findMany({
          where: { active: true },
          orderBy: { sortOrder: 'asc' },
        }),
        this.prisma.clinicalHistory.findMany({
          include: {
            patient: { include: { patientType: true } },
            phases: {
              include: {
                phaseTemplate: true,
                subgroups: {
                  include: {
                    subgroupTemplate: true,
                    criterionScores: {
                      include: { criterionTemplate: true },
                    },
                  },
                },
              },
              orderBy: { phaseTemplate: { sortOrder: 'asc' } },
            },
          },
          orderBy: { updatedAt: 'desc' },
        }),
      ]);

    const phaseStats = phaseTemplates.map((template) => {
      let approvedCount = 0;
      let pendingCount = 0;
      const scores: number[] = [];

      for (const history of histories) {
        const phase = history.phases.find(
          (p) => p.phaseTemplateId === template.id,
        );
        if (!phase) {
          pendingCount += 1;
          continue;
        }
        const subgroupAvgs = phase.subgroups.map((sg) =>
          weightedAverage(
            sg.criterionScores.map((c) => c.score),
            sg.criterionScores.map((c) => c.criterionTemplate.weightPct),
          ),
        );
        const phaseScore = weightedAverage(
          subgroupAvgs,
          phase.subgroups.map((sg) => sg.subgroupTemplate.weightPct),
        );
        scores.push(phaseScore);
        if (phaseScore > APPROVAL_THRESHOLD) approvedCount += 1;
        else pendingCount += 1;
      }

      return {
        id: template.id,
        sortOrder: template.sortOrder,
        name: template.name,
        description: template.description,
        weightPct: template.weightPct,
        approvedCount,
        pendingCount,
        averageScore:
          scores.length > 0
            ? round2(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null,
      };
    });

    const typeMap = new Map<string, number>();
    const patientProgress = histories.map((history) => {
      const typeName = history.patient.patientType.name;
      typeMap.set(typeName, (typeMap.get(typeName) || 0) + 1);

      const phaseScores = history.phases.map((phase) => {
        const subgroupAvgs = phase.subgroups.map((sg) =>
          weightedAverage(
            sg.criterionScores.map((c) => c.score),
            sg.criterionScores.map((c) => c.criterionTemplate.weightPct),
          ),
        );
        return {
          phase,
          score: weightedAverage(
            subgroupAvgs,
            phase.subgroups.map((sg) => sg.subgroupTemplate.weightPct),
          ),
        };
      });

      const approved = phaseScores.filter((p) => p.score > APPROVAL_THRESHOLD);
      const pending = phaseScores.filter((p) => p.score <= APPROVAL_THRESHOLD);
      const globalScore = weightedAverage(
        phaseScores.map((p) => p.score),
        phaseScores.map((p) => p.phase.phaseTemplate.weightPct),
      );
      const lastApproved = approved[approved.length - 1];
      const nextPending = pending[0];

      return {
        id: history.patient.id,
        firstName: history.patient.firstName,
        lastName: history.patient.lastName,
        document: history.patient.document,
        patientType: typeName,
        completedPhases: approved.length,
        totalPhases: history.phases.length,
        pendingPhases: pending.length,
        globalScore,
        currentPhase: nextPending
          ? {
              name: nextPending.phase.phaseTemplate.name,
              sortOrder: nextPending.phase.phaseTemplate.sortOrder,
              status: 'PENDING' as const,
              score: nextPending.score,
            }
          : lastApproved
            ? {
                name: lastApproved.phase.phaseTemplate.name,
                sortOrder: lastApproved.phase.phaseTemplate.sortOrder,
                status: 'COMPLETED' as const,
                score: lastApproved.score,
              }
            : null,
        lastCompletedPhase: lastApproved
          ? {
              name: lastApproved.phase.phaseTemplate.name,
              sortOrder: lastApproved.phase.phaseTemplate.sortOrder,
              score: lastApproved.score,
            }
          : null,
      };
    });

    const withProgress = patientProgress.filter((p) => p.globalScore > 0);
    const globalScores = patientProgress.map((p) => p.globalScore);
    const scoreChanges = await this.prisma.scoreChangeLog.count();

    return {
      totals: {
        patients,
        professionals,
        patientTypes,
        phaseTemplates: phaseTemplates.length,
        evaluations: scoreChanges,
      },
      scores: {
        averageGlobal:
          globalScores.length > 0
            ? round2(
                globalScores.reduce((a, b) => a + b, 0) / globalScores.length,
              )
            : null,
        patientsWithEvaluations: withProgress.length,
        patientsWithoutEvaluations: patients - withProgress.length,
        fullyCompleted: patientProgress.filter(
          (p) => p.totalPhases > 0 && p.pendingPhases === 0,
        ).length,
      },
      phases: phaseStats,
      byPatientType: Array.from(typeMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
      patients: patientProgress.sort((a, b) =>
        a.lastName.localeCompare(b.lastName),
      ),
    };
  }
}
