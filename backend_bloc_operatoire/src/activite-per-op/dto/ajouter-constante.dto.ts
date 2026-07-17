import { IsNumber, IsString, IsDateString } from 'class-validator';

export class AjouterConstanteDto {
  @IsNumber() fc: number;
  @IsString() ta: string;
  @IsNumber() spo2: number;
  @IsNumber() temperature: number;
  @IsNumber() capnie: number;
  @IsNumber() score: number;
  // ISO 8601, capturé côté client au moment de la saisie.
  @IsDateString() horodatage: string;
}
