import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import {
  PatientBloc,
  NiveauUrgence,
  PatientStatut,
} from '../entities/patient-bloc.entity';
import { DemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { AccueilClient } from '../external/accueil.client';
import { DossierPatientClient } from '../external/dossier-patient.client';
import { ProtocoleOperatoireService } from '../protocole-operatoire/protocole-operatoire.service';
import { niveauDepuisEchelle } from '../common/urgence';
import { construireIdDossier } from '../common/id-dossier';

@Injectable()
export class PatientBlocService {
  constructor(
    @InjectRepository(PatientBloc)
    private patientRepo: Repository<PatientBloc>,
    @InjectRepository(DemandeCpaExterne)
    private demandeRepo: Repository<DemandeCpaExterne>,
    private accueilClient: AccueilClient,
    private dossierPatientClient: DossierPatientClient,
    private protocoleOperatoireService: ProtocoleOperatoireService,
    private config: ConfigService,
  ) {}

  async creerDepuisPrescription(demandeId: string): Promise<PatientBloc> {
    const demande = await this.demandeRepo.findOne({
      where: { id: demandeId },
    });
    if (!demande) throw new Error('Demande non trouvée');

    // Échelle commune à tous les canaux d'arrivée (voir common/urgence.ts) : le seuil local
    // "urgence >= 3 -> TRES_URGENT" ne correspondait ni au seuil ">= 4" utilisé par le même
    // service pour marquer la notification et le créneau urgents, ni au "=== 3" du frontend.
    const niveauUrgence = niveauDepuisEchelle(demande.urgence);
    // Un patient urgent n'a pas de "vérification à la veille" (chirurgie immédiate) : il passe
    // par la même consultation que la CPA, juste étiquetée VPA côté interface. Le statut initial
    // est donc toujours EN_ATTENTE_CPA, urgent ou non.

    // Patient déjà suivi au bloc : patientId est la clé primaire de PatientBloc. Un patient dont
    // le précédent séjour est terminé (SORTI) ou dont la CPA avait été refusée (CPA_INAPTE) peut
    // REVENIR pour une nouvelle prise en charge : on rouvre sa fiche pour ce nouvel épisode
    // (statut EN_ATTENTE_CPA + infos du service demandeur), au lieu de la renvoyer telle quelle —
    // sinon la nouvelle demande externe restait invisible dans le fil "à traiter". Un patient en
    // pleine prise en charge (CPA_REALISE, veille, bloc, réveil...) n'est, lui, pas réinitialisé.
    const existant = await this.patientRepo.findOne({
      where: { patientId: demande.patientId },
    });
    if (existant) {
      const episodeTermine: PatientStatut[] = [
        PatientStatut.SORTI,
        PatientStatut.CPA_INAPTE,
      ];
      if (episodeTermine.includes(existant.statut)) {
        Object.assign(existant, {
          statut: PatientStatut.EN_ATTENTE_CPA,
          niveauUrgence,
          prescripteurId: demande.sourceServiceId,
          serviceOrigine: demande.sourceServiceName || null,
          serviceOrigineId: demande.sourceServiceId || null,
          dateIntervention: demande.dateExamenSouhaitee || null,
        });
        const saved = await this.patientRepo.save(existant);
        return Array.isArray(saved) ? saved[0] : saved;
      }
      return existant;
    }

    const patient = new PatientBloc();
    patient.patientId = demande.patientId;
    patient.chuId = demande.chuId;
    patient.idDossier = construireIdDossier(demande.patientId);
    // Jamais un groupe inventé : un groupe sanguin faux est plus dangereux qu'une case vide.
    patient.groupeSanguin = 'INCONNU';
    patient.niveauUrgence = niveauUrgence;
    patient.statut = PatientStatut.EN_ATTENTE_CPA;
    patient.prescripteurId = demande.sourceServiceId;
    patient.serviceOrigine = demande.sourceServiceName || null;
    patient.serviceOrigineId = demande.sourceServiceId || null;
    // Sans ceci, "Date et heure prévues de l'opération" restait vide pour tout patient venu
    // d'une demande CPA externe — la seule date connue à ce stade est celle souhaitée par le
    // service demandeur, transmise dès la demande.
    patient.dateIntervention = demande.dateExamenSouhaitee || null;

    const saved = await this.patientRepo.save(patient);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  estStat(patientId: string): boolean {
    return false;
  }

  async findAll(filters: {
    statut?: string;
    niveauUrgence?: string;
    recherche?: string;
    page?: number;
    limite?: number;
  }) {
    const { statut, niveauUrgence, recherche, page = 1, limite = 10 } = filters;
    const qb = this.patientRepo.createQueryBuilder('p');

    if (statut) qb.andWhere('p.statut = :statut', { statut });
    if (niveauUrgence)
      qb.andWhere('p.niveauUrgence = :niveauUrgence', { niveauUrgence });
    if (recherche)
      qb.andWhere('p.idDossier ILIKE :recherche', {
        recherche: `%${recherche}%`,
      });

    qb.orderBy('p.createdAt', 'DESC');
    qb.skip((page - 1) * limite).take(limite);

    const [data, total] = await qb.getManyAndCount();
    // PatientBloc ne stocke pas l'identité (nom/prénom) — elle vit dans le service Accueil.
    // Sans cet enrichissement, chaque écran de liste (Patient du jour, Archives...) n'a que le
    // patientId à afficher, faute de nom disponible dans la réponse.
    let enriched: any[] = data;
    try {
      enriched = await this.accueilClient.enrichWithIdentity(data);
    } catch {
      // dégradé silencieusement vers les données non enrichies (patientId visible plutôt que
      // rien) si le service Accueil est indisponible
    }
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(patientId: string): Promise<PatientBloc | null> {
    const patient = await this.patientRepo.findOne({ where: { patientId } });
    if (!patient) return null;
    try {
      return await this.accueilClient.enrichWithIdentity(patient);
    } catch {
      return patient;
    }
  }

  // Contenu complet du dossier médical partagé (service externe Dossier Patient), pour la vraie
  // fiche "Dossier Patient" (pas seulement un résumé) : antécédents actifs, diagnostics posés,
  // histoire de la maladie actuelle, alertes urgentes, dernier examen physique, examens
  // complémentaires urgents, suivi/évolution. Tolérant aux pannes : une catégorie indisponible
  // n'empêche pas les autres de s'afficher (chaque appel du client échoue en silence vers []).
  async getDossierMedical(patientId: string, token: string) {
    const [
      antecedents,
      diagnostics,
      histoireMaladie,
      alertesUrgentes,
      dernierExamen,
      examensComplementaires,
      suivis,
    ] = await Promise.all([
      this.dossierPatientClient.getAntecedentsActifs(patientId, token),
      this.dossierPatientClient.getDiagnostics(patientId, token),
      this.dossierPatientClient.getHistoriqueMaladieRecente(patientId, token),
      this.dossierPatientClient.getHistoriquesUrgents(patientId, token),
      this.dossierPatientClient.getDernierExamenPhysique(patientId, token),
      this.dossierPatientClient.getExamensComplementairesUrgents(
        patientId,
        token,
      ),
      this.dossierPatientClient.getSuivis(patientId, token),
    ]);
    return {
      antecedents,
      diagnostics,
      histoireMaladie,
      alertesUrgentes,
      dernierExamen,
      examensComplementaires,
      suivis,
    };
  }

  // Vue complète et en lecture seule du dossier patient, organisée par onglets côté frontend
  // (Observation médicale, Diagnostic, Suivi/Évolution, Compte-rendu opératoire, Résultats
  // paracliniques, Sortie, Historique). Contrairement à getDossierMedical() (résumé condensé
  // utilisé dans les écrans de suivi bloc), celui-ci récupère l'intégralité de ce que le service
  // Dossier Patient externe expose, plus nos propres protocoles opératoires.
  async getDossierComplet(patientId: string, token: string) {
    const [
      observations,
      diagnostics,
      antecedents,
      histoiresMaladie,
      examensPhysiques,
      examensComplementaires,
      suivis,
      protocolesOperatoires,
    ] = await Promise.all([
      this.dossierPatientClient.getObservations(patientId, token),
      this.dossierPatientClient.getDiagnosticsTous(patientId, token),
      this.dossierPatientClient.getAntecedentsTous(patientId, token),
      this.dossierPatientClient.getHistoiresMaladie(patientId, token),
      this.dossierPatientClient.getExamensPhysiquesTous(patientId, token),
      this.dossierPatientClient.getExamensComplementairesTous(patientId, token),
      this.dossierPatientClient.getSuivis(patientId, token),
      this.protocoleOperatoireService
        .findAll(1, 50, patientId)
        .then((r) => r.data)
        .catch(() => []),
    ]);

    // La sortie médicale se consulte par épisode d'hospitalisation, pas par patient — on prend
    // le plus récent episodeId connu (diagnostic ou histoire de la maladie) à défaut d'un suivi
    // d'admission dédié dans ce service.
    const episodeId = diagnostics.find((d: any) => d.episodeId)?.episodeId;
    const sortie = episodeId
      ? await this.dossierPatientClient.getSortieMedicale(episodeId, token)
      : [];

    return {
      observations,
      diagnostics,
      antecedents,
      histoiresMaladie,
      examensPhysiques,
      examensComplementaires,
      suivis,
      protocolesOperatoires,
      sortie,
    };
  }

  async update(patientId: string, dto: any): Promise<PatientBloc> {
    const patient = await this.patientRepo.findOne({ where: { patientId } });
    if (!patient) throw new Error('Patient non trouvé');
    Object.assign(patient, dto);
    const saved = await this.patientRepo.save(patient);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async remove(patientId: string): Promise<{ message: string }> {
    await this.patientRepo.delete(patientId);
    return { message: 'Patient supprimé du bloc' };
  }

  async search(q?: string): Promise<any[]> {
    return [];
  }

  async getExternal(externalId: string): Promise<any> {
    return null;
  }

  private verifierDateInterventionValide(dateIntervention?: string) {
    if (!dateIntervention) return;
    const aujourdhui = new Date().toISOString().split('T')[0];
    if (new Date(dateIntervention).toISOString().split('T')[0] < aujourdhui) {
      throw new BadRequestException(
        "Impossible de planifier l'opération à une date passée.",
      );
    }
  }

  async admitExisting(dto: any): Promise<PatientBloc> {
    this.verifierDateInterventionValide(dto?.dateIntervention);
    const patient = this.patientRepo.create({
      ...dto,
      chuId: dto.chuId || this.config.get<string>('externalServices.chuId'),
      statut: PatientStatut.EN_ATTENTE_CPA,
      niveauUrgence: dto.niveauUrgence || NiveauUrgence.NORMAL,
    });
    const saved = await this.patientRepo.save(patient);
    return Array.isArray(saved) ? saved[0] : saved;
  }

  async registerAndAdmit(dto: any, createdBy: string): Promise<PatientBloc> {
    this.verifierDateInterventionValide(dto?.dateIntervention);
    const patient = this.patientRepo.create({
      ...dto,
      chuId: dto.chuId || this.config.get<string>('externalServices.chuId'),
      statut: PatientStatut.EN_ATTENTE_CPA,
      niveauUrgence: dto.niveauUrgence || NiveauUrgence.NORMAL,
    });
    const saved = await this.patientRepo.save(patient);
    return Array.isArray(saved) ? saved[0] : saved;
  }
}
