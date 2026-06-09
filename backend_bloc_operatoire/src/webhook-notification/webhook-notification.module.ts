import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { WebhookNotificationController } from './webhook-notification.controller';
import { WebhookNotificationService } from './webhook-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationCPA])],
  controllers: [WebhookNotificationController],
  providers: [WebhookNotificationService],
})
export class WebhookNotificationModule {}
