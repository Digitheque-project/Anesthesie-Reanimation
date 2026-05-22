import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CPA } from '../entities/cpa.entity';
import { Patient } from '../entities/patient.entity';
import { Premedicament } from '../entities/premedicament.entity';
import { CPAService } from './cpa.service';
import { CPAController } from './cpa.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CPA, Patient, Premedicament])],
  controllers: [CPAController],
  providers: [CPAService],
  exports: [CPAService],
})
export class CPAModule {}
