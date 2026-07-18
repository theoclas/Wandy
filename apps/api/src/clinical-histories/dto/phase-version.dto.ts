import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class ItemScoreDto {
  @IsUUID()
  phaseItemTemplateId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  score!: number;
}

export class CreatePhaseVersionDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemScoreDto)
  itemScores!: ItemScoreDto[];

  @IsDateString()
  evaluationDate!: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  clarificationNote?: string;
}

export class UpdateClinicalHistoryDto {
  @IsDateString()
  historyDate!: string;
}
