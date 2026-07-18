import { IsString, IsEnum, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { StatutNotificationCPA } from '../../entities/notification-cpa.entity';

export class CreateNotificationCPADto {
  @IsString() heurePrescription: string;
  @IsOptional() @IsDateString() dateIntervention?: string;
  @IsString() patientId: string;
  @IsString() intervention: string;
  @IsString() chirurgienId: string;
  @IsString() professeurCPA: string;
  @IsBoolean() estUrgent: boolean;
  @IsOptional() @IsEnum(StatutNotificationCPA) statut?: StatutNotificationCPA;
}
