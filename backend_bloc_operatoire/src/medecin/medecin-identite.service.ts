import { Injectable } from '@nestjs/common';
import { MedecinService } from './medecin.service';
import { CentralUserClient } from '../external/central-user.client';

// Résout l'identité d'un médecin référencé par un id qui appartient à l'un de deux espaces de
// noms possibles : un userId du service central SSO (médecin interne, cas normal depuis que
// l'écriture n'exige plus de fiche locale), ou un id de la table locale `medecins` (médecin
// externe à la plateforme, ou donnée déjà écrite avant ce changement). Tente d'abord le
// service central, puis retombe sur la table locale — jamais de throw, dégradation
// silencieuse comme les autres enrichissements externes de ce backend (AccueilClient...).
@Injectable()
export class MedecinIdentiteService {
  constructor(
    private readonly medecinService: MedecinService,
    private readonly centralUserClient: CentralUserClient,
  ) {}

  // Résolution en lot : id -> identité (ou absent si introuvable dans les deux espaces). Utile
  // pour les requêtes SQL agrégées (GROUP BY sur un id de médecin) qui n'ont plus de relation
  // TypeORM à joindre.
  async resoudreLot(
    ids: (string | null | undefined)[],
  ): Promise<Record<string, any>> {
    const uniques = Array.from(new Set(ids.filter(Boolean))) as string[];
    if (!uniques.length) return {};

    const central = await this.centralUserClient.getUsers(uniques);
    const manquants = uniques.filter((id) => !central[id]);
    const locaux: Record<string, any> = {};
    await Promise.all(
      manquants.map(async (id) => {
        try {
          locaux[id] = await this.medecinService.findOne(id);
        } catch {
          // Ni central ni local : dégradation silencieuse, le champ reste vide côté frontend.
        }
      }),
    );

    const resultat: Record<string, any> = {};
    for (const id of uniques) {
      const identite = central[id] || locaux[id];
      if (identite) resultat[id] = identite;
    }
    return resultat;
  }

  // Enrichit une liste d'enregistrements en attachant, sous `outputKey`, l'identité résolue à
  // partir de leur champ `idField` — même clé que l'ancienne relation TypeORM (`anesthesiste`,
  // `medecin`, `chirurgien`...) pour que le frontend n'ait rien à changer pour l'affichage.
  async enrichir<T extends Record<string, any>>(
    records: T[],
    idField: string,
    outputKey: string,
  ): Promise<(T & Record<string, any>)[]> {
    const identites = await this.resoudreLot(records.map((r) => r?.[idField]));
    return records.map((r) => {
      const id = r?.[idField];
      return { ...r, [outputKey]: id ? identites[id] || null : null };
    });
  }

  // Variante pour les entités référençant plusieurs médecins (ex: ProtocoleOperatoire :
  // chirurgien, anesthésiste, infirmière, aide opératoire) — applique `enrichir` pour chaque
  // paire [idField, outputKey] successivement.
  async enrichirPlusieurs<T extends Record<string, any>>(
    records: T[],
    paires: [string, string][],
  ): Promise<(T & Record<string, any>)[]> {
    let resultat: (T & Record<string, any>)[] = records;
    for (const [idField, outputKey] of paires) {
      resultat = await this.enrichir(resultat, idField, outputKey);
    }
    return resultat;
  }
}
