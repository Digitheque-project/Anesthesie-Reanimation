import { IsString, IsDateString, IsBoolean, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class ConstanteDto {
  @IsString() heure: string;
  @IsOptional() fc?: number;
  @IsOptional() @IsString() ta?: string;
  @IsOptional() spo2?: number;
  @IsOptional() temperature?: number;
  @IsOptional() capnie?: number;
  @IsOptional() score?: number;
}

export class CreateActivitePerOpDto {
  @IsString() patientId: string;
  @IsString() chirurgienId: string;
  @IsString() anesthesisteId: string;
  @IsDateString() dateOperation: string;
  @IsOptional() @IsString() perfusions?: string;
  @IsOptional() @IsString() transfusions?: string;
  @IsOptional() @IsString() journalSorties?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => ConstanteDto) constantes?: ConstanteDto[];
  @IsBoolean() intubationOT: boolean;
  @IsBoolean() sArme: boolean;
  @IsBoolean() masqueLarynge: boolean;
  @IsOptional() ventilation?: any;
  @IsOptional() @IsArray() @IsString({ each: true }) etatArrivee?: string[];
}
