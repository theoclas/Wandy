import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { Gender } from '@prisma/client';

export class CreatePatientDto {
  @IsString()
  @MinLength(2)
  firstName!: string;

  @IsString()
  @MinLength(2)
  lastName!: string;

  @IsString()
  @MinLength(3)
  document!: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsDateString()
  birthDate!: string;

  @IsDateString()
  centerEntryDate!: string;

  @IsUUID()
  patientTypeId!: string;

  @IsOptional()
  @IsUUID()
  professionalId?: string;
}

export class UpdatePatientDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  document?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsDateString()
  centerEntryDate?: string;

  @IsOptional()
  @IsUUID()
  patientTypeId?: string;

  @IsOptional()
  @IsUUID()
  professionalId?: string | null;
}
