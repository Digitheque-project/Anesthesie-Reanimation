import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

// Service externe partagé "Dossier Patient" (dossier médical complet, toutes spécialités
// confondues). On y va en lecture seule pour n'afficher que ce qui est pertinent pour le bloc
// opératoire (antécédents actifs, alertes médicales urgentes, dernier examen physique) — le
// token SSO de l'utilisateur connecté est transmis tel quel, ce service applique sa propre
// vérification d'accès.
@Injectable()
export class DossierPatientClient {
  private readonly logger = new Logger(DossierPatientClient.name);
  private readonly baseUrl: string;
  private readonly chuId: string;
  private readonly serviceId: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('externalServices.dossierPatientApiUrl') ?? '';
    this.chuId = this.config.get<string>('externalServices.chuId') ?? '';
    this.serviceId = this.config.get<string>('externalServices.serviceId') ?? '';
  }

  private async get(path: string, patientId: string, token: string): Promise<any[]> {
    if (!this.baseUrl) {
      this.logger.warn('DOSSIER_PATIENT_API_URL non configuré, dossier médical externe ignoré');
      return [];
    }
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}${path}`, {
          params: { chuId: this.chuId, serviceId: this.serviceId, patientId },
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      );
      return Array.isArray(data) ? data : data?.data ?? [];
    } catch (err) {
      this.logger.warn(`Échec appel Dossier Patient (${path}): ${(err as Error).message}`);
      return [];
    }
  }

  getAntecedentsActifs(patientId: string, token: string) {
    return this.get('/dossier-patient/antecedents/active', patientId, token);
  }

  getHistoriquesUrgents(patientId: string, token: string) {
    return this.get('/dossier-patient/medical-histories/emergency', patientId, token);
  }

  getDernierExamenPhysique(patientId: string, token: string) {
    return this.get('/dossier-patient/physical-examinations/all/latest', patientId, token);
  }
}
