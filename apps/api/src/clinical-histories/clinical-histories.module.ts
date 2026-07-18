import { Module } from '@nestjs/common';
import { ClinicalHistoriesService } from './clinical-histories.service';
import { ClinicalHistoriesController } from './clinical-histories.controller';

@Module({
  controllers: [ClinicalHistoriesController],
  providers: [ClinicalHistoriesService],
  exports: [ClinicalHistoriesService],
})
export class ClinicalHistoriesModule {}
