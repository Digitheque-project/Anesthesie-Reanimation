import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { StatutDemandeCpaExterne } from '../../entities/demande-cpa-externe.entity';

export class UpdateDemandeCpaDto {
  @IsOptional()
  @IsEnum(StatutDemandeCpaExterne)
  statut?: StatutDemandeCpaExterne;
  @IsOptional() @IsDateString() dateCpaPlanifiee?: string;
  @IsOptional() @IsDateString() dateVpaPlanifiee?: string;
}
