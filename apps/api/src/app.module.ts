import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PatientTypesModule } from './patient-types/patient-types.module';
import { ProfessionalsModule } from './professionals/professionals.module';
import { PatientsModule } from './patients/patients.module';
import { PhaseTemplatesModule } from './phase-templates/phase-templates.module';
import { ClinicalHistoriesModule } from './clinical-histories/clinical-histories.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    PatientTypesModule,
    ProfessionalsModule,
    PatientsModule,
    PhaseTemplatesModule,
    ClinicalHistoriesModule,
    DashboardModule,
  ],
})
export class AppModule {}
