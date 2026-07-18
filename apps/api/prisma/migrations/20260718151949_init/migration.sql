-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'PROFESSIONAL');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED');

-- CreateEnum
CREATE TYPE "PatientPhaseStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Professional" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "gender" "Gender" NOT NULL DEFAULT 'UNSPECIFIED',
    "specialty" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Professional_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "document" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "gender" "Gender" NOT NULL DEFAULT 'UNSPECIFIED',
    "birthDate" DATE NOT NULL,
    "systemEntryDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "centerEntryDate" DATE NOT NULL,
    "patientTypeId" TEXT NOT NULL,
    "professionalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhaseTemplate" (
    "id" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "crisis" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhaseTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhaseItemTemplate" (
    "id" TEXT NOT NULL,
    "phaseTemplateId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PhaseItemTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClinicalHistory" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClinicalHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientPhase" (
    "id" TEXT NOT NULL,
    "clinicalHistoryId" TEXT NOT NULL,
    "phaseTemplateId" TEXT NOT NULL,
    "status" "PatientPhaseStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientPhase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientPhaseVersion" (
    "id" TEXT NOT NULL,
    "patientPhaseId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "score" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "clarificationNote" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientPhaseVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientPhaseItemScore" (
    "id" TEXT NOT NULL,
    "patientPhaseVersionId" TEXT NOT NULL,
    "phaseItemTemplateId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,

    CONSTRAINT "PatientPhaseItemScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Professional_document_key" ON "Professional"("document");

-- CreateIndex
CREATE UNIQUE INDEX "Professional_userId_key" ON "Professional"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientType_name_key" ON "PatientType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_document_key" ON "Patient"("document");

-- CreateIndex
CREATE UNIQUE INDEX "ClinicalHistory_patientId_key" ON "ClinicalHistory"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientPhase_clinicalHistoryId_phaseTemplateId_key" ON "PatientPhase"("clinicalHistoryId", "phaseTemplateId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientPhaseVersion_patientPhaseId_versionNumber_key" ON "PatientPhaseVersion"("patientPhaseId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PatientPhaseItemScore_patientPhaseVersionId_phaseItemTempla_key" ON "PatientPhaseItemScore"("patientPhaseVersionId", "phaseItemTemplateId");

-- AddForeignKey
ALTER TABLE "Professional" ADD CONSTRAINT "Professional_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_patientTypeId_fkey" FOREIGN KEY ("patientTypeId") REFERENCES "PatientType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "Professional"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhaseItemTemplate" ADD CONSTRAINT "PhaseItemTemplate_phaseTemplateId_fkey" FOREIGN KEY ("phaseTemplateId") REFERENCES "PhaseTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClinicalHistory" ADD CONSTRAINT "ClinicalHistory_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPhase" ADD CONSTRAINT "PatientPhase_clinicalHistoryId_fkey" FOREIGN KEY ("clinicalHistoryId") REFERENCES "ClinicalHistory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPhase" ADD CONSTRAINT "PatientPhase_phaseTemplateId_fkey" FOREIGN KEY ("phaseTemplateId") REFERENCES "PhaseTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPhaseVersion" ADD CONSTRAINT "PatientPhaseVersion_patientPhaseId_fkey" FOREIGN KEY ("patientPhaseId") REFERENCES "PatientPhase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPhaseVersion" ADD CONSTRAINT "PatientPhaseVersion_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPhaseItemScore" ADD CONSTRAINT "PatientPhaseItemScore_patientPhaseVersionId_fkey" FOREIGN KEY ("patientPhaseVersionId") REFERENCES "PatientPhaseVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientPhaseItemScore" ADD CONSTRAINT "PatientPhaseItemScore_phaseItemTemplateId_fkey" FOREIGN KEY ("phaseItemTemplateId") REFERENCES "PhaseItemTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
