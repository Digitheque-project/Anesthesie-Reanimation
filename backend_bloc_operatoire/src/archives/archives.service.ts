import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';

@Injectable()
export class ArchivesService {
  constructor(
    @InjectRepository(PatientBloc)
    private patientBlocRepo: Repository<PatientBloc>,
    @InjectRepository(CPA) private cpaRepository: Repository<CPA>,
    @InjectRepository(VerificationVeille)
    private verificationVeilleRepository: Repository<VerificationVeille>,
    @InjectRepository(BonCommandeAnesthesie)
    private bonRepo: Repository<BonCommandeAnesthesie>,
    @InjectRepository(ActivitePerOp)
    private activiteRepo: Repository<ActivitePerOp>,
    @InjectRepository(ProtocoleOperatoire)
    private protocoleRepo: Repository<ProtocoleOperatoire>,
    @InjectRepository(ScoreSCCRE) private scoreRepo: Repository<ScoreSCCRE>,
    @InjectRepository(SortieReveil)
    private sortieRepo: Repository<SortieReveil>,
    @InjectRepository(ChecklistAvantOp)
    private checklistAvantRepo: Repository<ChecklistAvantOp>,
    @InjectRepository(ChecklistPendantOp)
    private checklistPendantRepo: Repository<ChecklistPendantOp>,
    @InjectRepository(ChecklistApresOp)
    private checklistApresRepo: Repository<ChecklistApresOp>,
    @InjectRepository(NotificationCPA)
    private notificationRepo: Repository<NotificationCPA>,
    @InjectRepository(DemandeCpaExterne)
    private demandeExterneRepo: Repository<DemandeCpaExterne>,
    @InjectRepository(MomentOperatoire)
    private momentRepo: Repository<MomentOperatoire>,
    private accueilClient: AccueilClient,
    private medecinIdentiteService: MedecinIdentiteService,
  ) {}

  private async getPatientEnrichi(patientId: string) {
    const suivi = await this.patientBlocRepo.findOne({ where: { patientId } });
    if (!suivi) throw new NotFoundException('Patient non trouvé');
    const identite = await this.accueilClient.getPatient(patientId);
    return { ...suivi, ...identite, patientId };
  }

  async getDossierComplet(patientId: string): Promise<any> {
    const patient = await this.getPatientEnrichi(patientId);

    const [
      notificationsRaw,
      demandesExternes,
      cpaRaw,
      verificationVeilleRaw,
      bonsRaw,
      checklistsAvant,
      checklistsPendant,
      checklistsApres,
      moments,
      activitesRaw,
      protocolesRaw,
      scoresRaw,
      sortiesRaw,
    ] = await Promise.all([
      this.notificationRepo.find({
        where: { patientId },
        order: { createdAt: 'ASC' },
      }),
      this.demandeExterneRepo.find({
        where: { patientId },
        order: { createdAt: 'ASC' },
      }),
      this.cpaRepository.find({
        where: { patientId },
        relations: ['premedicaments'],
      }),
      this.verificationVeilleRepository.find({ where: { patientId } }),
      this.bonRepo.find({ where: { patientId }, relations: ['items'] }),
      this.checklistAvantRepo.find({ where: { patientId } }),
      this.checklistPendantRepo.find({ where: { patientId } }),
      this.checklistApresRepo.find({ where: { patientId } }),
      this.momentRepo.find({
        where: { patientId },
        order: { horodatage: 'ASC' },
      }),
      this.activiteRepo.find({
        where: { patientId },
        relations: ['constantes'],
      }),
      this.protocoleRepo.find({
        where: { patientId },
        relations: ['drainages'],
      }),
      this.scoreRepo.find({ where: { patientId } }),
      this.sortieRepo.find({ where: { patientId }, relations: ['scoreSCCRE'] }),
    ]);

    // Résolution des identités médecin (userId central ou id local `medecins`) attachées sous
    // les mêmes clés que les anciennes relations TypeORM, pour que le frontend n'ait rien à
    // changer.
    const [
      notifications,
      cpa,
      verificationVeille,
      bons,
      activites,
      protocoles,
      scores,
      sorties,
    ] = await Promise.all([
      this.medecinIdentiteService.enrichir(
        notificationsRaw,
        'chirurgienId',
        'chirurgien',
      ),
      this.medecinIdentiteService.enrichir(
        cpaRaw,
        'anesthesisteId',
        'anesthesiste',
      ),
      this.medecinIdentiteService.enrichir(
        verificationVeilleRaw,
        'anesthesisteId',
        'anesthesiste',
      ),
      this.medecinIdentiteService.enrichirPlusieurs(bonsRaw, [
        ['chirurgienId', 'chirurgien'],
        ['anesthesisteId', 'anesthesiste'],
      ]),
      this.medecinIdentiteService.enrichirPlusieurs(activitesRaw, [
        ['chirurgienId', 'chirurgien'],
        ['anesthesisteId', 'anesthesiste'],
      ]),
      this.medecinIdentiteService.enrichirPlusieurs(protocolesRaw, [
        ['chirurgienId', 'chirurgien'],
        ['anesthesisteId', 'anesthesiste'],
        ['infirmiereId', 'infirmiere'],
        ['aideOperatoireId', 'aideOperatoire'],
      ]),
      this.medecinIdentiteService.enrichir(
        scoresRaw,
        'anesthesisteId',
        'anesthesiste',
      ),
      this.medecinIdentiteService.enrichir(sortiesRaw, 'medecinId', 'medecin'),
    ]);

    return {
      patient,
      // Étape 1 : prescription reçue — interne (fil de prescription du service) et/ou externe
      // (demande d'un autre service, ex. Endoscopie).
      notifications,
      demandesCpaExternes: demandesExternes,
      cpa: cpa[0] || null,
      verificationVeille: verificationVeille[0] || null,
      bonsCommande: bons,
      checklistsAvantOp: checklistsAvant,
      checklistsPendantOp: checklistsPendant,
      checklistsApresOp: checklistsApres,
      // Chronologie horodatée des moments de l'opération (incision, fermeture...).
      momentsOperatoires: moments,
      activitesPerOp: activites,
      protocolesOperatoires: protocoles,
      scoresSCCRE: scores,
      sortiesReveil: sorties,
      dateArchivage: new Date().toISOString(),
    };
  }

  async getResumePatient(patientId: string): Promise<any> {
    const patient = await this.getPatientEnrichi(patientId);
    const nbInterventions = await this.activiteRepo.count({
      where: { patientId },
    });
    const dernierScore = await this.scoreRepo.findOne({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
    return {
      patient,
      nombreInterventions: nbInterventions,
      dernierScoreSCCRE: dernierScore?.scoreTotal || null,
      statutActuel: patient.statut,
    };
  }
}
