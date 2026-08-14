import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ServiceTokenService } from '../central-auth/service-token.service';

// Détail opératoire de la prescription. Les services prescripteurs ne nomment pas tous ces
// champs à l'identique (et certains les placent sur l'acte, d'autres à la racine de la
// prescription) : les alias sont donc déclarés ici et résolus à l'ingestion — voir
// PrescriptionService.champPrescription. Aucun n'est obligatoire.
export interface DetailOperatoireExterne {
  renseignementClinique?: string | null;
  renseignementsCliniques?: string | null;
  typeAnesthesie?: string | null;
  dureeIntervention?: number | string | null;
  dureePrevue?: number | string | null;
  dureeInterventionMinutes?: number | string | null;
  risqueInfectieux?: string | null;
  materielNecessaire?: string | null;
  materiel?: string | null;
  positionPatient?: string | null;
  position?: string | null;
}

export interface ActeBlocExterne extends DetailOperatoireExterne {
  id: string;
  libelle: string;
  cote?: string | null;
  typeChirurgie?: string | null;
  risqueHemorragique?: string | null;
  dateIntervention?: string | null;
  heureIntervention?: string | null;
  nomChirurgien?: string | null;
}

export interface PrescriptionBlocExterne extends DetailOperatoireExterne {
  id: string;
  patientId: string;
  prescripteurId: string;
  urgence: 'NORMAL' | 'URGENT' | 'TRES_URGENT' | string;
  alertes?: string | null;
  dateIntervention?: string | null;
  chirurgien?: string | null;
  consignes?: string | null;
  typeChirurgie?: string | null;
  risqueHemorragique?: string | null;
  statut: string;
  chuId: string;
  serviceIdSource?: string | null;
  serviceIdDest: string;
  actes?: ActeBlocExterne[];
  ActeBloc?: ActeBlocExterne[];
}

// Client vers le service central "Prescriptions" (multi-service) : c'est lui qui reçoit les
// prescriptions de bloc opératoire émises par les services prescripteurs (chirurgie, urgences...).
@Injectable()
export class PrescriptionExterneClient {
  private readonly logger = new Logger(PrescriptionExterneClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly serviceToken: ServiceTokenService,
  ) {
    this.baseUrl =
      this.config.get<string>('externalServices.prescriptionApiUrl') ?? '';
  }

  // Appelé depuis un job de fond (@Interval), sans utilisateur connecté dont on pourrait
  // transmettre le jeton — on signe donc notre propre jeton de service (voir
  // ServiceTokenService), accepté par ce service car il partage le même secret HS256 que la
  // gateway centrale (confirmé en le testant en direct : 200 au lieu de 401 sans jeton).
  private authHeaders() {
    return { Authorization: `Bearer ${this.serviceToken.mint()}` };
  }

  async getPrescriptionsBloc(
    serviceIdDest: string,
  ): Promise<PrescriptionBlocExterne[]> {
    if (!this.baseUrl) {
      this.logger.warn('PRESCRIPTION_API_URL non configuré');
      return [];
    }
    try {
      const { data } = await firstValueFrom(
        this.http.get<PrescriptionBlocExterne[]>(
          `${this.baseUrl}/prescriptions/bloc`,
          {
            params: { serviceIdDest },
            headers: this.authHeaders(),
          },
        ),
      );
      return Array.isArray(data) ? data : [];
    } catch (err) {
      this.logger.error(
        `Erreur récupération prescriptions bloc: ${(err as Error).message}`,
      );
      return [];
    }
  }

  async updateStatut(id: string, statut: string): Promise<void> {
    if (!this.baseUrl) return;
    try {
      await firstValueFrom(
        this.http.put(
          `${this.baseUrl}/prescriptions/bloc/${id}/statut`,
          { statut },
          { headers: this.authHeaders() },
        ),
      );
    } catch (err) {
      this.logger.error(
        `Erreur mise à jour statut prescription ${id}: ${(err as Error).message}`,
      );
    }
  }
}
