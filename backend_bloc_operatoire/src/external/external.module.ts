import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccueilClient } from './accueil.client';
import { ServiceChuClient } from './service-chu.client';
import { EndoscopieClient } from './endoscopie.client';
import { NotificationOutgoingService } from './notification-outgoing.service';
import { PrescriptionExterneClient } from './prescription-externe.client';
import { PrescriptionImagerieClient } from './prescription-imagerie.client';
import { NotificationBackClient } from './notification-back.client';
import { DossierPatientClient } from './dossier-patient.client';

@Global()
@Module({
  imports: [HttpModule.register({ timeout: 45000 }), ConfigModule],
  providers: [
    {
      provide: AccueilClient,
      useFactory: (config: ConfigService) => new AccueilClient(config.getOrThrow<string>('externalServices.accueilApiUrl')),
      inject: [ConfigService],
    },
    ServiceChuClient,
    EndoscopieClient,
    NotificationOutgoingService,
    PrescriptionExterneClient,
    PrescriptionImagerieClient,
    NotificationBackClient,
    DossierPatientClient,
  ],
  exports: [
    AccueilClient,
    ServiceChuClient,
    EndoscopieClient,
    NotificationOutgoingService,
    PrescriptionExterneClient,
    PrescriptionImagerieClient,
    NotificationBackClient,
    DossierPatientClient,
  ],
})
export class ExternalModule {}
