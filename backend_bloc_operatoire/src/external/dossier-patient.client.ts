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

  // Les schémas de réponse ne sont pas documentés dans le Swagger du service (200 vide) : selon
  // l'endpoint, la donnée peut arriver nue (tableau ou objet) ou enveloppée dans { data }. On
  // normalise systématiquement en tableau pour que l'appelant n'ait jamais à distinguer les cas.
  private async get(path: string, params: Record<string, string>, token: string): Promise<any[]> {
    if (!this.baseUrl) {
      this.logger.warn('DOSSIER_PATIENT_API_URL non configuré, dossier médical externe ignoré');
      return [];
    }
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}${path}`, {
          params,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }),
      );
      const payload = data && typeof data === 'object' && !Array.isArray(data) && 'data' in data ? data.data : data;
      if (Array.isArray(payload)) return payload;
      if (payload && typeof payload === 'object') return [payload];
      return [];
    } catch (err) {
      this.logger.warn(`Échec appel Dossier Patient (${path}): ${(err as Error).message}`);
      return [];
    }
  }

  private getParPatient(path: string, patientId: string, token: string) {
    return this.get(path, { chuId: this.chuId, serviceId: this.serviceId, patientId }, token);
  }

  getAntecedentsActifs(patientId: string, token: string) {
    return this.getParPatient('/dossier-patient/antecedents/active', patientId, token);
  }

  getDiagnostics(patientId: string, token: string) {
    return this.getParPatient('/dossier-patient/diagnostics', patientId, token);
  }

  getHistoriqueMaladieRecente(patientId: string, token: string) {
    return this.getParPatient('/dossier-patient/medical-histories/latest', patientId, token);
  }

  getHistoriquesUrgents(patientId: string, token: string) {
    return this.getParPatient('/dossier-patient/medical-histories/emergency', patientId, token);
  }

  getDernierExamenPhysique(patientId: string, token: string) {
    return this.getParPatient('/dossier-patient/physical-examinations/all/latest', patientId, token);
  }

  getExamensComplementairesUrgents(patientId: string, token: string) {
    return this.getParPatient('/dossier-patient/complementary-examinations/urgent', patientId, token);
  }

  getSuivis(patientId: string, token: string) {
    return this.get(
      `/dossier-patient/patients/${encodeURIComponent(patientId)}/suivis`,
      { chuId: this.chuId, serviceId: this.serviceId },
      token,
    );
  }
}
