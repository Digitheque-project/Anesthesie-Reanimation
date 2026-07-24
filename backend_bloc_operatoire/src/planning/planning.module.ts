import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreneauBloc } from '../entities/creneau-bloc.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';
import { MedecinModule } from '../medecin/medecin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CreneauBloc, PatientBloc]),
    MedecinModule,
  ],
  controllers: [PlanningController],
  providers: [PlanningService],
  exports: [PlanningService],
})
export class PlanningModule {}
