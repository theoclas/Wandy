import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClinicalHistoriesService } from './clinical-histories.service';
import {
  CreatePhaseVersionDto,
  UpdateClinicalHistoryDto,
} from './dto/phase-version.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.decorator';

@Controller('patients/:patientId')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClinicalHistoriesController {
  constructor(private service: ClinicalHistoriesService) {}

  @Get('clinical-history')
  getHistory(@Param('patientId') patientId: string) {
    return this.service.getByPatient(patientId);
  }

  @Patch('clinical-history')
  updateHistory(
    @Param('patientId') patientId: string,
    @Body() dto: UpdateClinicalHistoryDto,
  ) {
    return this.service.updateHistoryDate(patientId, dto);
  }

  @Get('phases/:phaseId/versions')
  getVersions(
    @Param('patientId') patientId: string,
    @Param('phaseId') phaseId: string,
  ) {
    return this.service.getPhaseVersions(patientId, phaseId);
  }

  @Post('phases/:phaseId/versions')
  createVersion(
    @Param('patientId') patientId: string,
    @Param('phaseId') phaseId: string,
    @Body() dto: CreatePhaseVersionDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.service.createVersion(patientId, phaseId, req.user.id, dto);
  }
}
