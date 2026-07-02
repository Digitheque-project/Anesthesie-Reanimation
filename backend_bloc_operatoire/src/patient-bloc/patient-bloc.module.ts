import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { PatientBlocService } from './patient-bloc.service';
import { PatientBlocController } from './patient-bloc.controller';
import { PatientBlocStatutService } from './patient-bloc-statut.service';

@Module({
  imports: [TypeOrmModule.forFeature([PatientBloc])],
  controllers: [PatientBlocController],
  providers: [PatientBlocService, PatientBlocStatutService],
  exports: [PatientBlocService, PatientBlocStatutService],
})
export class PatientBlocModule {}
