import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface ArticlePharmacie {
  id: string;
  dci: string;
  dosage: string;
  conditionnement: string;
  sale_price: number;
  stock_total: number;
  stock_minimum: number;
  stock_safety: number;
}

const DUREE_CACHE_MS = 5 * 60 * 1000;

// Client vers le catalogue public (lecture seule, sans authentification) du service Pharmacie —
// GET /articles/stock-sale-prices, prévu par ce service pour que d'autres services du SIH
// affichent le coût avant l'enregistrement d'une prescription. Résultat mis en cache en mémoire
// quelques minutes : c'est un catalogue de prix, pas une donnée qui change à la seconde, inutile
// de le réinterroger à chaque ouverture de la liste des médicaments.
@Injectable()
export class PharmacieClient {
  private readonly logger = new Logger(PharmacieClient.name);
  private readonly baseUrl: string;
  private cache: { expiresAt: number; data: ArticlePharmacie[] } | null = null;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('externalServices.pharmacieApiUrl') ?? '';
  }

  async getStockSalePrices(): Promise<ArticlePharmacie[]> {
    if (!this.baseUrl) {
      this.logger.warn('PHARMACIE_API_URL non configuré');
      return [];
    }
    if (this.cache && this.cache.expiresAt > Date.now()) {
      return this.cache.data;
    }
    try {
      const { data } = await firstValueFrom(
        this.http.get<ArticlePharmacie[]>(`${this.baseUrl}/articles/stock-sale-prices`),
      );
      const articles = Array.isArray(data) ? data : [];
      this.cache = { expiresAt: Date.now() + DUREE_CACHE_MS, data: articles };
      return articles;
    } catch (err) {
      this.logger.error(`Erreur récupération catalogue prix Pharmacie: ${(err as Error).message}`);
      return this.cache?.data ?? [];
    }
  }
}
