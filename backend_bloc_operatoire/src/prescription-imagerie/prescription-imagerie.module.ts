import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { CreneauBloc } from '../entities/creneau-bloc.entity';
import { PrescriptionImagerieListenerService } from './prescription-imagerie-listener.service';
import { PrescriptionModule } from '../prescription/prescription.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationCPA, PatientBloc, CreneauBloc]),
    PrescriptionModule,
  ],
  providers: [PrescriptionImagerieListenerService],
})
export class PrescriptionImagerieModule {}
