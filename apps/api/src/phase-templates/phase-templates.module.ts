import { Module } from '@nestjs/common';
import { PhaseTemplatesService } from './phase-templates.service';
import { PhaseTemplatesController } from './phase-templates.controller';

@Module({
  controllers: [PhaseTemplatesController],
  providers: [PhaseTemplatesService],
  exports: [PhaseTemplatesService],
})
export class PhaseTemplatesModule {}
