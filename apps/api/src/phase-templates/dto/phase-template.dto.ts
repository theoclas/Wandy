import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNumber,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class WeightItemDto {
  @IsUUID()
  id!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  weightPct!: number;
}

export class UpdateWeightsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WeightItemDto)
  phases!: WeightItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightItemDto)
  subgroups!: WeightItemDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeightItemDto)
  criteria!: WeightItemDto[];
}
