import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { PatientBlocService } from './patient-bloc.service';
import { PatientBlocController } from './patient-bloc.controller';
import { PatientBlocStatutService } from './patient-bloc-statut.service';
import { ProtocoleOperatoireModule } from '../protocole-operatoire/protocole-operatoire.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientBloc, DemandeCpaExterne]),
    ProtocoleOperatoireModule,
  ],
  controllers: [PatientBlocController],
  providers: [PatientBlocService, PatientBlocStatutService],
  exports: [PatientBlocService, PatientBlocStatutService],
})
export class PatientBlocModule {}
