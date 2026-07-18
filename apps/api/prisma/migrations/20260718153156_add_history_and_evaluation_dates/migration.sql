-- AlterTable
ALTER TABLE "ClinicalHistory" ADD COLUMN     "historyDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PatientPhaseVersion" ADD COLUMN     "evaluationDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;
