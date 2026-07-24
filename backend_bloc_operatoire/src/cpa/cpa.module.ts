import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CPA } from '../entities/cpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { Premedicament } from '../entities/premedicament.entity';
import { DemandeCpaExterneModule } from '../demande-cpa-externe/demande-cpa-externe.module';
import { MedecinModule } from '../medecin/medecin.module';
import { CPAService } from './cpa.service';
import { CPAController } from './cpa.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CPA, PatientBloc, Premedicament]),
    DemandeCpaExterneModule,
    MedecinModule,
  ],
  controllers: [CPAController],
  providers: [CPAService],
  exports: [CPAService],
})
export class CPAModule {}
