import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { PrescriptionImagerieListenerService } from './prescription-imagerie-listener.service';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationCPA])],
  providers: [PrescriptionImagerieListenerService],
})
export class PrescriptionImagerieModule {}
