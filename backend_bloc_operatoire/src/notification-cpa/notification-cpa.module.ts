import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { CreneauBloc } from '../entities/creneau-bloc.entity';
import { NotificationCPAService } from './notification-cpa.service';
import { NotificationCPAController } from './notification-cpa.controller';
import { NotificationAlerteService } from './notification-alerte.service';
import { NotificationAlerteController } from './notification-alerte.controller';
import { MedecinModule } from '../medecin/medecin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationCPA,
      WebhookNotification,
      PatientBloc,
      CreneauBloc,
    ]),
    MedecinModule,
  ],
  controllers: [NotificationCPAController, NotificationAlerteController],
  providers: [NotificationCPAService, NotificationAlerteService],
  exports: [NotificationCPAService, NotificationAlerteService],
})
export class NotificationCPAModule {}
