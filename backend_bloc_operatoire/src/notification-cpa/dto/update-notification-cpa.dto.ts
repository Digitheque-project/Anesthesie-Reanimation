import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationCPADto } from './create-notification-cpa.dto';
export class UpdateNotificationCPADto extends PartialType(CreateNotificationCPADto) {}
