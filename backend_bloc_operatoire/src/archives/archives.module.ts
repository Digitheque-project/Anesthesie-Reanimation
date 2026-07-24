import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { CPA } from '../entities/cpa.entity';
import { VerificationVeille } from '../entities/verification-veille.entity';
import { BonCommandeAnesthesie } from '../entities/bon-commande-anesthesie.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { MomentOperatoire } from '../entities/moment-operatoire.entity';
import { ArchivesService } from './archives.service';
import { ArchivesController } from './archives.controller';
import { MedecinModule } from '../medecin/medecin.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PatientBloc,
      CPA,
      VerificationVeille,
      BonCommandeAnesthesie,
      ActivitePerOp,
      ProtocoleOperatoire,
      ScoreSCCRE,
      SortieReveil,
      ChecklistAvantOp,
      ChecklistPendantOp,
      ChecklistApresOp,
      NotificationCPA,
      DemandeCpaExterne,
      MomentOperatoire,
    ]),
    MedecinModule,
  ],
  controllers: [ArchivesController],
  providers: [ArchivesService],
  exports: [ArchivesService],
})
export class ArchivesModule {}
