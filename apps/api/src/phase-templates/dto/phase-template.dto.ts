import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePhaseTemplateDto {
  @IsInt()
  @Min(1)
  sortOrder!: number;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsString()
  @MinLength(2)
  crisis!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePhaseTemplateDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  crisis?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class CreatePhaseItemDto {
  @IsInt()
  @Min(1)
  sortOrder!: number;

  @IsString()
  @MinLength(2)
  label!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdatePhaseItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  sortOrder?: number;

  @IsOptional()
  @IsString()
  @MinLength(2)
  label?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
