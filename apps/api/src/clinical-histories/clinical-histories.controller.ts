import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ClinicalHistoriesService } from './clinical-histories.service';
import {
  UpdateClinicalHistoryDto,
  UpdateCriterionScoreDto,
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

  @Get('criteria/:criterionScoreId/history')
  getCriterionHistory(
    @Param('patientId') patientId: string,
    @Param('criterionScoreId') criterionScoreId: string,
  ) {
    return this.service.getCriterionHistory(patientId, criterionScoreId);
  }

  @Patch('criteria/:criterionScoreId')
  updateCriterion(
    @Param('patientId') patientId: string,
    @Param('criterionScoreId') criterionScoreId: string,
    @Body() dto: UpdateCriterionScoreDto,
    @Req() req: { user: { id: string } },
  ) {
    return this.service.updateCriterionScore(
      patientId,
      criterionScoreId,
      req.user.id,
      dto,
    );
  }
}
