import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { Medecin } from '../entities/medecin.entity';
import { CPA } from '../entities/cpa.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { MomentOperatoire } from '../entities/moment-operatoire.entity';
import { RapportsService } from './rapports.service';
import { RapportsController } from './rapports.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    PatientBloc, ActivitePerOp, ScoreSCCRE, Medecin, CPA, NotificationCPA,
    SortieReveil, ChecklistAvantOp, ChecklistPendantOp, ChecklistApresOp, MomentOperatoire,
  ])],
  controllers: [RapportsController],
  providers: [RapportsService],
  exports: [RapportsService],
})
export class RapportsModule {}
