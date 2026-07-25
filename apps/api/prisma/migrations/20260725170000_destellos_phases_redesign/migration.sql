-- Wipe old Erikson clinical model and create Destellos hierarchy.

DROP TABLE IF EXISTS "PatientPhaseItemScore" CASCADE;
DROP TABLE IF EXISTS "PatientPhaseVersion" CASCADE;
DROP TABLE IF EXISTS "PatientPhase" CASCADE;
DROP TABLE IF EXISTS "ClinicalHistory" CASCADE;
DROP TABLE IF EXISTS "PhaseItemTemplate" CASCADE;
DROP TABLE IF EXISTS "PhaseTemplate" CASCADE;
DROP TABLE IF EXISTS "ScoreChangeLog" CASCADE;
DROP TABLE IF EXISTS "PatientCriterionScore" CASCADE;
DROP TABLE IF EXISTS "PatientSubgroup" CASCADE;
DROP TABLE IF EXISTS "CriterionTemplate" CASCADE;
DROP TABLE IF EXISTS "SubgroupTemplate" CASCADE;

DROP TYPE IF EXISTS "PhaseUnlockMode";

CREATE TYPE "PhaseUnlockMode" AS ENUM ('ALL_OPEN', 'SEQUENTIAL');

CREATE TABLE "PhaseTemplate" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "unlockMode" "PhaseUnlockMode" NOT NULL DEFAULT 'ALL_OPEN',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhaseTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PhaseTemplate_sortOrder_key" ON "PhaseTemplate"("sortOrder");

CREATE TABLE "SubgroupTemplate" (
    "id" TEXT NOT NULL,
    "phaseTemplateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "unlockRank" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL,
    "purpose" TEXT,
    "hideInUi" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubgroupTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SubgroupTemplate_phaseTemplateId_sortOrder_key" ON "SubgroupTemplate"("phaseTemplateId", "sortOrder");

CREATE TABLE "CriterionTemplate" (
    "id" TEXT NOT NULL,
    "subgroupTemplateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CriterionTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CriterionTemplate_subgroupTemplateId_sortOrder_key" ON "CriterionTemplate"("subgroupTemplateId", "sortOrder");

CREATE TABLE "ClinicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "historyDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalHistory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ClinicalHistory_patientId_key" ON "ClinicalHistory"("patientId");

CREATE TABLE "PatientPhase" (
    "id" TEXT NOT NULL,
    "clinicalHistoryId" TEXT NOT NULL,
    "phaseTemplateId" TEXT NOT NULL,
    "status" "PatientPhaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientPhase_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PatientPhase_clinicalHistoryId_phaseTemplateId_key" ON "PatientPhase"("clinicalHistoryId", "phaseTemplateId");

CREATE TABLE "PatientSubgroup" (
    "id" TEXT NOT NULL,
    "patientPhaseId" TEXT NOT NULL,
    "subgroupTemplateId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientSubgroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PatientSubgroup_patientPhaseId_subgroupTemplateId_key" ON "PatientSubgroup"("patientPhaseId", "subgroupTemplateId");

CREATE TABLE "PatientCriterionScore" (
    "id" TEXT NOT NULL,
    "patientSubgroupId" TEXT NOT NULL,
    "criterionTemplateId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientCriterionScore_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PatientCriterionScore_patientSubgroupId_criterionTemplateId_key" ON "PatientCriterionScore"("patientSubgroupId", "criterionTemplateId");

CREATE TABLE "ScoreChangeLog" (
    "id" TEXT NOT NULL,
    "patientCriterionScoreId" TEXT NOT NULL,
    "previousScore" DOUBLE PRECISION NOT NULL,
    "newScore" DOUBLE PRECISION NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changedById" TEXT NOT NULL,

    CONSTRAINT "ScoreChangeLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SubgroupTemplate" ADD CONSTRAINT "SubgroupTemplate_phaseTemplateId_fkey" FOREIGN KEY ("phaseTemplateId") REFERENCES "PhaseTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CriterionTemplate" ADD CONSTRAINT "CriterionTemplate_subgroupTemplateId_fkey" FOREIGN KEY ("subgroupTemplateId") REFERENCES "SubgroupTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ClinicalHistory" ADD CONSTRAINT "ClinicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientPhase" ADD CONSTRAINT "PatientPhase_clinicalHistoryId_fkey" FOREIGN KEY ("clinicalHistoryId") REFERENCES "ClinicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientPhase" ADD CONSTRAINT "PatientPhase_phaseTemplateId_fkey" FOREIGN KEY ("phaseTemplateId") REFERENCES "PhaseTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PatientSubgroup" ADD CONSTRAINT "PatientSubgroup_patientPhaseId_fkey" FOREIGN KEY ("patientPhaseId") REFERENCES "PatientPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientSubgroup" ADD CONSTRAINT "PatientSubgroup_subgroupTemplateId_fkey" FOREIGN KEY ("subgroupTemplateId") REFERENCES "SubgroupTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "PatientCriterionScore" ADD CONSTRAINT "PatientCriterionScore_patientSubgroupId_fkey" FOREIGN KEY ("patientSubgroupId") REFERENCES "PatientSubgroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "PatientCriterionScore" ADD CONSTRAINT "PatientCriterionScore_criterionTemplateId_fkey" FOREIGN KEY ("criterionTemplateId") REFERENCES "CriterionTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "ScoreChangeLog" ADD CONSTRAINT "ScoreChangeLog_patientCriterionScoreId_fkey" FOREIGN KEY ("patientCriterionScoreId") REFERENCES "PatientCriterionScore"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ScoreChangeLog" ADD CONSTRAINT "ScoreChangeLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
