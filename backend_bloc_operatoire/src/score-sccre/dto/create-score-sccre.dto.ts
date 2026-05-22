import { IsString, IsEnum, IsDateString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { StatutScoreSCCRE } from '../../entities/score-sccre.entity';

export class CreateScoreSCCREDto {
  @IsString() patientId: string;
  @IsString() anesthesisteId: string;
  @IsString() heureArrivee: string;
  @IsDateString() dateEvaluation: string;
  @IsNumber() @Min(0) @Max(2) motricite: number;
  @IsNumber() @Min(0) @Max(2) respiration: number;
  @IsNumber() @Min(0) @Max(2) pressionArterielle: number;
  @IsNumber() @Min(0) @Max(2) etatConscience: number;
  @IsNumber() @Min(0) @Max(2) coloration: number;
  @IsNumber() @Min(1) @Max(3) evs: number;
  @IsNumber() @Min(1) @Max(3) eqa: number;
  @IsNumber() @Min(0) @Max(10) eva: number;
  @IsOptional() etatInitial?: { intubation: boolean; curarisation: boolean };
  @IsOptional() reponse?: { intubation: boolean; curarisation: boolean };
  @IsBoolean() sortieAutorisee: boolean;
  @IsOptional() @IsEnum(StatutScoreSCCRE) statut?: StatutScoreSCCRE;
}
