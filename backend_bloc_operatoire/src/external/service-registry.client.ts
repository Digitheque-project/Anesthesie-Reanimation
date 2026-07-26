import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ServiceTokenService } from '../central-auth/service-token.service';

// Client vers le service central "registre des services" (multi-CHU) : résout un serviceId en
// nom lisible (ex. "Chirurgie", "Urgences") — les prescriptions/demandes reçues d'un autre
// service ne transmettent que son id, jamais son nom. Même schéma que CentralUserClient (jeton
// de service, jamais de throw, dégradation silencieuse vers null).
@Injectable()
export class ServiceRegistryClient {
  private readonly logger = new Logger(ServiceRegistryClient.name);
  private readonly baseUrl: string;
  // Les noms de service changent rarement — cache en mémoire pour éviter un aller-retour réseau
  // à chaque notification/prescription affichée.
  private readonly cache = new Map<string, { nom: string; expireLe: number }>();
  private readonly cacheDureeMs = 10 * 60 * 1000;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly serviceToken: ServiceTokenService,
  ) {
    this.baseUrl =
      this.config.get<string>('externalServices.serviceRegistryUrl') ?? '';
  }

  private authHeaders() {
    return { Authorization: `Bearer ${this.serviceToken.mint()}` };
  }

  async getServiceName(id: string | null | undefined): Promise<string | null> {
    if (!this.baseUrl || !id) return null;
    const enCache = this.cache.get(id);
    if (enCache && enCache.expireLe > Date.now()) return enCache.nom;

    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/services/${id}`, {
          headers: this.authHeaders(),
        }),
      );
      const nom = data?.name || data?.nom || null;
      if (nom) this.cache.set(id, { nom, expireLe: Date.now() + this.cacheDureeMs });
      return nom;
    } catch (err: any) {
      if (err?.response?.status !== 404) {
        this.logger.error(
          `Erreur résolution nom du service ${id}: ${err?.message ?? err}`,
        );
      }
      return null;
    }
  }
}
