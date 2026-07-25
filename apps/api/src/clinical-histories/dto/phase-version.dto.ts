import { Type } from 'class-transformer';
import { IsDateString, IsNumber, Max, Min } from 'class-validator';

export class UpdateClinicalHistoryDto {
  @IsDateString()
  historyDate!: string;
}

export class UpdateCriterionScoreDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  score!: number;
}
