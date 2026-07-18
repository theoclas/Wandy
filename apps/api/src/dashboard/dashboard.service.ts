import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      patients,
      professionals,
      patientTypes,
      phaseTemplates,
      clinicalHistories,
    ] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.professional.count({ where: { active: true } }),
      this.prisma.patientType.count({ where: { active: true } }),
      this.prisma.phaseTemplate.findMany({
        where: { active: true },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { patientPhases: true } },
        },
      }),
      this.prisma.clinicalHistory.findMany({
        include: {
          patient: {
            include: { patientType: true },
          },
          phases: {
            include: {
              phaseTemplate: true,
              versions: {
                where: { isCurrent: true },
                take: 1,
              },
            },
            orderBy: { phaseTemplate: { sortOrder: 'asc' } },
          },
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    const phaseStats = phaseTemplates.map((template) => {
      let completedCount = 0;
      let pendingCount = 0;
      const scores: number[] = [];

      for (const history of clinicalHistories) {
        const phase = history.phases.find(
          (p) => p.phaseTemplateId === template.id,
        );
        if (!phase) {
          pendingCount += 1;
          continue;
        }
        if (phase.versions[0]) {
          completedCount += 1;
          scores.push(phase.versions[0].score);
        } else {
          pendingCount += 1;
        }
      }

      return {
        id: template.id,
        sortOrder: template.sortOrder,
        name: template.name,
        crisis: template.crisis,
        completedCount,
        pendingCount,
        averageScore:
          scores.length > 0
            ? round1(scores.reduce((a, b) => a + b, 0) / scores.length)
            : null,
      };
    });

    const typeMap = new Map<string, number>();
    const patientProgress = clinicalHistories.map((history) => {
      const typeName = history.patient.patientType.name;
      typeMap.set(typeName, (typeMap.get(typeName) || 0) + 1);

      const completed = history.phases.filter((p) => p.versions[0]);
      const pending = history.phases.filter((p) => !p.versions[0]);
      const scores = completed.map((p) => p.versions[0].score);
      const globalScore =
        scores.length > 0
          ? round1(scores.reduce((a, b) => a + b, 0) / scores.length)
          : null;

      const lastCompleted = completed[completed.length - 1];
      const nextPending = pending[0];

      return {
        id: history.patient.id,
        firstName: history.patient.firstName,
        lastName: history.patient.lastName,
        document: history.patient.document,
        patientType: typeName,
        completedPhases: completed.length,
        totalPhases: history.phases.length,
        pendingPhases: pending.length,
        globalScore,
        currentPhase: nextPending
          ? {
              name: nextPending.phaseTemplate.name,
              sortOrder: nextPending.phaseTemplate.sortOrder,
              status: 'PENDING' as const,
            }
          : lastCompleted
            ? {
                name: lastCompleted.phaseTemplate.name,
                sortOrder: lastCompleted.phaseTemplate.sortOrder,
                status: 'COMPLETED' as const,
              }
            : null,
        lastCompletedPhase: lastCompleted
          ? {
              name: lastCompleted.phaseTemplate.name,
              sortOrder: lastCompleted.phaseTemplate.sortOrder,
              score: lastCompleted.versions[0].score,
            }
          : null,
      };
    });

    const withEval = patientProgress.filter((p) => p.completedPhases > 0);
    const globalScores = withEval
      .map((p) => p.globalScore)
      .filter((s): s is number => s !== null);

    const totalEvaluations = phaseStats.reduce(
      (acc, p) => acc + p.completedCount,
      0,
    );

    return {
      totals: {
        patients,
        professionals,
        patientTypes,
        phaseTemplates: phaseTemplates.length,
        evaluations: totalEvaluations,
      },
      scores: {
        averageGlobal:
          globalScores.length > 0
            ? round1(
                globalScores.reduce((a, b) => a + b, 0) / globalScores.length,
              )
            : null,
        patientsWithEvaluations: withEval.length,
        patientsWithoutEvaluations: patients - withEval.length,
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
