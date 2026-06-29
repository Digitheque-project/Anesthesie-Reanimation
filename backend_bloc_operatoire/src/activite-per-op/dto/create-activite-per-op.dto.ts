import { IsString, IsDateString, IsBoolean, IsArray, IsOptional, ValidateNested, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class ConstanteDto {
  @IsString()
  heure: string;

  @IsOptional()
  @IsNumber()
  fc?: number;

  @IsOptional()
  @IsString()
  ta?: string;

  @IsOptional()
  @IsNumber()
  spo2?: number;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  capnie?: number;

  @IsOptional()
  @IsNumber()
  score?: number;
}

export class CreateActivitePerOpDto {
  @IsUUID()
  patientId: string;

  @IsOptional()
  @IsUUID()
  chirurgienId?: string;

  @IsOptional()
  @IsUUID()
  anesthesisteId?: string;

  @IsDateString()
  dateOperation: string;

  @IsOptional()
  @IsString()
  perfusions?: string;

  @IsOptional()
  @IsString()
  transfusions?: string;

  @IsOptional()
  @IsString()
  journalSorties?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ConstanteDto)
  constantes?: ConstanteDto[];  // ✅ Tableau de constantes

  @IsBoolean()
  intubationOT: boolean;

  @IsBoolean()
  sArme: boolean;

  @IsBoolean()
  masqueLarynge: boolean;

  @IsOptional()
  ventilation?: {
    spontanee?: string;
    assistee?: string;
    controlee?: string;
    peep?: string;
    circuitFerme?: string;
  };

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  etatArrivee?: string[];
}
