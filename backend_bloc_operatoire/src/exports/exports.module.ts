import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { MedecinModule } from '../medecin/medecin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientBloc, ActivitePerOp]),
    MedecinModule,
  ],
  controllers: [ExportsController],
  providers: [ExportsService],
  exports: [ExportsService],
})
export class ExportsModule {}
