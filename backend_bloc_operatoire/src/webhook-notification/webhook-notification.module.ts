import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { WebhookNotificationController } from './webhook-notification.controller';
import { WebhookNotificationService } from './webhook-notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookNotification])],
  controllers: [WebhookNotificationController],
  providers: [WebhookNotificationService],
})
export class WebhookNotificationModule {}
