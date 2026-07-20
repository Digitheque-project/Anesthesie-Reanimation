import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { PrescriptionImagerieListenerService } from './prescription-imagerie-listener.service';
import { PrescriptionModule } from '../prescription/prescription.module';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationCPA]), PrescriptionModule],
  providers: [PrescriptionImagerieListenerService],
})
export class PrescriptionImagerieModule {}
