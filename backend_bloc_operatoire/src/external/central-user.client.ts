import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ServiceTokenService } from '../central-auth/service-token.service';

export interface IdentiteCentrale {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  matricule?: string | null;
  numeroOrdre?: string | null;
  ordre?: string | null;
}

// Client vers le service central "users" (SSO) : permet de résoudre l'identité d'un
// utilisateur déjà authentifié (nom, prénom, numéro d'Ordre...) à partir de son userId
// central, sans dépendre d'une fiche locale dupliquée dans `medecins`. Auth service-à-service
// via ServiceTokenService (même schéma que PrescriptionExterneClient).
@Injectable()
export class CentralUserClient {
  private readonly logger = new Logger(CentralUserClient.name);
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    private readonly serviceToken: ServiceTokenService,
  ) {
    this.baseUrl =
      this.config.get<string>('externalServices.centralUserServiceUrl') ?? '';
  }

  private authHeaders() {
    return { Authorization: `Bearer ${this.serviceToken.mint()}` };
  }

  private normaliser(u: any): IdentiteCentrale {
    return {
      id: u.id ?? u.userId,
      nom: u.name,
      prenom: u.firstname,
      email: u.email,
      telephone: u.phone ?? null,
      matricule: u.matricule ?? null,
      numeroOrdre: u.registration_number_professional_order ?? null,
      ordre: u.professional_order ?? null,
    };
  }

  async getUser(id: string): Promise<IdentiteCentrale | null> {
    if (!this.baseUrl || !id) return null;
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${this.baseUrl}/users/${id}`, {
          headers: this.authHeaders(),
        }),
      );
      return data ? this.normaliser(data) : null;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      this.logger.error(
        `Erreur récupération utilisateur central ${id}: ${err?.message ?? err}`,
      );
      return null;
    }
  }

  // Résolution en lot, tolérante aux échecs individuels — jamais de throw qui casserait un
  // findAll appelant (même principe que AccueilClient.enrichWithIdentity).
  async getUsers(ids: string[]): Promise<Record<string, IdentiteCentrale>> {
    const uniques = Array.from(new Set(ids.filter(Boolean)));
    const identites: Record<string, IdentiteCentrale> = {};
    await Promise.all(
      uniques.map(async (id) => {
        const u = await this.getUser(id);
        if (u) identites[id] = u;
      }),
    );
    return identites;
  }
}
