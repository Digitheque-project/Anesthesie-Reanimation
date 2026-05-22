import { IsString, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { StatutNotificationCPA } from '../../entities/notification-cpa.entity';

export class CreateNotificationCPADto {
  @IsString() heurePrescription: string;
  @IsString() patientId: string;
  @IsString() intervention: string;
  @IsString() chirurgienId: string;
  @IsString() professeurCPA: string;
  @IsBoolean() estUrgent: boolean;
  @IsOptional() @IsEnum(StatutNotificationCPA) statut?: StatutNotificationCPA;
}
