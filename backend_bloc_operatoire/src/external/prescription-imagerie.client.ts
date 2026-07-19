import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Une prescription imagerie = une ligne par examen (voir PrescriptionImagerieController côté
// service Prescription — "Créer une prescription avec plusieurs examens"). `serviceIdDest`
// indique le service destinataire : on ne retient que les lignes qui nous ciblent.
export interface PrescriptionImagerieExterne {
  id: string;
  patientId: string;
  prescripteurId: string;
  urgence: string;
  alertes?: string | null;
  renseignements?: string | null;
  notes?: string | null;
  chuId?: string | null;
  serviceIdSource?: string | null;
  serviceIdDest?: string | null;
  type?: string | null;
  precisions?: string | null;
  prescripteurExterne?: boolean;
  prescripteurNomManuel?: string | null;
  prescripteurPrenomManuel?: string | null;
  statut: string;
  createdAt: string;
  updatedAt: string;
}

// Client vers le service central "Prescription" (imagerie) — distinct de l'ancien
// PrescriptionExterneClient (prescriptions bloc opératoire). Le service Notification nous
// avertit en temps réel qu'une prescription imagerie nous concerne (voir
// prescription-imagerie/prescription-imagerie-listener.service.ts) ; on vient alors chercher
// son contenu ici par GET, on ne reçoit jamais la donnée elle-même par push.
@Injectable()
export class PrescriptionImagerieClient {
  private readonly logger = new Logger(PrescriptionImagerieClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('externalServices.prescriptionImagerieApiUrl') ?? '';
  }

  // Toutes les réponses du service Prescription imagerie sont enveloppées dans
  // { data, timestamp } (confirmé sur le service réel — pas documenté dans le Swagger).
  async getParPatient(patientId: string): Promise<PrescriptionImagerieExterne[]> {
    if (!this.baseUrl) {
      this.logger.warn('PRESCRIPTION_IMAGERIE_API_URL non configuré');
      return [];
    }
    try {
      const { data } = await firstValueFrom(
        this.http.get<{ data: PrescriptionImagerieExterne[] }>(
          `${this.baseUrl}/api/prescriptions/imagerie/patient/${encodeURIComponent(patientId)}`,
        ),
      );
      return Array.isArray(data?.data) ? data.data : [];
    } catch (err) {
      this.logger.error(`Erreur récupération prescriptions imagerie du patient ${patientId}: ${(err as Error).message}`);
      return [];
    }
  }

  async getParId(id: string): Promise<PrescriptionImagerieExterne | null> {
    if (!this.baseUrl) {
      this.logger.warn('PRESCRIPTION_IMAGERIE_API_URL non configuré');
      return null;
    }
    try {
      const { data } = await firstValueFrom(
        this.http.get<{ data: PrescriptionImagerieExterne }>(`${this.baseUrl}/api/prescriptions/imagerie/${encodeURIComponent(id)}`),
      );
      return data?.data ?? null;
    } catch (err) {
      this.logger.error(`Erreur récupération prescription imagerie ${id}: ${(err as Error).message}`);
      return null;
    }
  }
}
