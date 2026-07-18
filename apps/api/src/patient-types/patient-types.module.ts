import { Module } from '@nestjs/common';
import { PatientTypesService } from './patient-types.service';
import { PatientTypesController } from './patient-types.controller';

@Module({
  controllers: [PatientTypesController],
  providers: [PatientTypesService],
  exports: [PatientTypesService],
})
export class PatientTypesModule {}
