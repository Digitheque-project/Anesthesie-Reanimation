import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ServiceTokenService } from '../central-auth/service-token.service';

export interface ActeBlocExterne {
  id: string;
  libelle: string;
  cote?: string | null;
  typeChirurgie?: string | null;
  risqueHemorragique?: string | null;
}

export interface PrescriptionBlocExterne {
  id: string;
  patientId: string;
  prescripteurId: string;
  urgence: 'NORMAL' | 'URGENT' | 'TRES_URGENT' | string;
  alertes?: string | null;
  dateIntervention?: string | null;
  chirurgien?: string | null;
  consignes?: string | null;
  statut: string;
  chuId: string;
  serviceIdSource?: string | null;
  serviceIdDest: string;
  actes: ActeBlocExterne[];
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
    this.baseUrl = this.config.get<string>('externalServices.prescriptionApiUrl') ?? '';
  }

  // Appelé depuis un job de fond (@Interval), sans utilisateur connecté dont on pourrait
  // transmettre le jeton — on signe donc notre propre jeton de service (voir
  // ServiceTokenService), accepté par ce service car il partage le même secret HS256 que la
  // gateway centrale (confirmé en le testant en direct : 200 au lieu de 401 sans jeton).
  private authHeaders() {
    return { Authorization: `Bearer ${this.serviceToken.mint()}` };
  }

  async getPrescriptionsBloc(serviceIdDest: string): Promise<PrescriptionBlocExterne[]> {
    if (!this.baseUrl) {
      this.logger.warn('PRESCRIPTION_API_URL non configuré');
      return [];
    }
    try {
      const { data } = await firstValueFrom(
        this.http.get<PrescriptionBlocExterne[]>(`${this.baseUrl}/prescriptions/bloc`, {
          params: { serviceIdDest },
          headers: this.authHeaders(),
        }),
      );
      return Array.isArray(data) ? data : [];
    } catch (err) {
      this.logger.error(`Erreur récupération prescriptions bloc: ${(err as Error).message}`);
      return [];
    }
  }

  async updateStatut(id: string, statut: string): Promise<void> {
    if (!this.baseUrl) return;
    try {
      await firstValueFrom(
        this.http.put(`${this.baseUrl}/prescriptions/bloc/${id}/statut`, { statut }, { headers: this.authHeaders() }),
      );
    } catch (err) {
      this.logger.error(`Erreur mise à jour statut prescription ${id}: ${(err as Error).message}`);
    }
  }
}
