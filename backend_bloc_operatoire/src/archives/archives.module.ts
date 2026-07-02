import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { CPA } from '../entities/cpa.entity';
import { VPA } from '../entities/vpa.entity';
import { BonCommandeAnesthesie } from '../entities/bon-commande-anesthesie.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { ArchivesService } from './archives.service';
import { ArchivesController } from './archives.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientBloc, CPA, VPA, BonCommandeAnesthesie,
      ActivitePerOp, ProtocoleOperatoire,
      ScoreSCCRE, SortieReveil,
      ChecklistAvantOp, ChecklistPendantOp, ChecklistApresOp,
    ]),
  ],
  controllers: [ArchivesController],
  providers: [ArchivesService],
  exports: [ArchivesService],
})
export class ArchivesModule {}
