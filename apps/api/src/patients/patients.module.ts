import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { ClinicalHistoriesModule } from '../clinical-histories/clinical-histories.module';

@Module({
  imports: [ClinicalHistoriesModule],
  controllers: [PatientsController],
  providers: [PatientsService],
  exports: [PatientsService],
})
export class PatientsModule {}
