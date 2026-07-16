import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccueilClient } from './accueil.client';
import { ServiceChuClient } from './service-chu.client';
import { EndoscopieClient } from './endoscopie.client';
import { NotificationOutgoingService } from './notification-outgoing.service';

@Global()
@Module({
  imports: [HttpModule.register({ timeout: 45000 }), ConfigModule],
  providers: [
    {
      provide: AccueilClient,
      useFactory: (config: ConfigService) => new AccueilClient(config.get<string>('externalServices.accueilApiUrl')),
      inject: [ConfigService],
    },
    ServiceChuClient,
    EndoscopieClient,
    NotificationOutgoingService,
  ],
  exports: [AccueilClient, ServiceChuClient, EndoscopieClient, NotificationOutgoingService],
})
export class ExternalModule {}
