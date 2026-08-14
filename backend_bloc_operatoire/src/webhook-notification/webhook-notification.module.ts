import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { WebhookNotificationController } from './webhook-notification.controller';
import { WebhookNotificationService } from './webhook-notification.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([WebhookNotification, PatientBloc, NotificationCPA]),
  ],
  controllers: [WebhookNotificationController],
  providers: [WebhookNotificationService],
})
export class WebhookNotificationModule {}
