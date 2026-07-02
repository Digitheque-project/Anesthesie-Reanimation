import { IsString, IsOptional, IsInt, IsDateString, Min, Max } from 'class-validator';

export class ReceiveDemandeCpaDto {
  @IsString() patientId: string;

  @IsString() sourceServiceId: string;
  @IsOptional() @IsString() sourceServiceName?: string;

  @IsString() sourceReferenceType: string;
  @IsString() sourceReferenceId: string;

  @IsString() typeAnesthesie: string;

  @IsOptional() @IsString() motif?: string;

  @IsOptional() @IsInt() @Min(1) @Max(5) urgence?: number;

  @IsOptional() @IsDateString() dateExamenSouhaitee?: string;
}
