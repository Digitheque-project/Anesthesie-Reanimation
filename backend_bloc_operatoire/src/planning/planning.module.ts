import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreneauBloc } from '../entities/creneau-bloc.entity';
import { Patient } from '../entities/patient.entity';
import { PlanningService } from './planning.service';
import { PlanningController } from './planning.controller';

@Module({
  imports: [TypeOrmModule.forFeature([CreneauBloc, Patient])],
  controllers: [PlanningController],
  providers: [PlanningService],
  exports: [PlanningService],
})
export class PlanningModule {}
