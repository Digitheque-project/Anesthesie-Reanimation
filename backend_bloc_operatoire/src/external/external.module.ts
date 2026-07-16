import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AccueilClient } from './accueil.client';
import { ServiceChuClient } from './service-chu.client';
import { EndoscopieClient } from './endoscopie.client';
import { NotificationOutgoingService } from './notification-outgoing.service';

@Global()
@Module({
  imports: [HttpModule.register({ timeout: 45000 })],
  providers: [AccueilClient, ServiceChuClient, EndoscopieClient, NotificationOutgoingService],
  exports: [AccueilClient, ServiceChuClient, EndoscopieClient, NotificationOutgoingService],
})
export class ExternalModule {}
