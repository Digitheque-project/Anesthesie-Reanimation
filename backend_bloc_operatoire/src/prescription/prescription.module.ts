import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { CPAModule } from '../cpa/cpa.module';
import { PrescriptionController } from './prescription.controller';
import { PrescriptionService } from './prescription.service';

@Module({
  imports: [TypeOrmModule.forFeature([PatientBloc, NotificationCPA]), CPAModule],
  controllers: [PrescriptionController],
  providers: [PrescriptionService],
  exports: [PrescriptionService],
})
export class PrescriptionModule {}
