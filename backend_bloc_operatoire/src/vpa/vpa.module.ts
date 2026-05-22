import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VPA } from '../entities/vpa.entity';
import { Patient } from '../entities/patient.entity';
import { VPAService } from './vpa.service';
import { VPAController } from './vpa.controller';

@Module({
  imports: [TypeOrmModule.forFeature([VPA, Patient])],
  controllers: [VPAController],
  providers: [VPAService],
  exports: [VPAService],
})
export class VPAModule {}
