import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CanalIngestion,
  IngestionExterne,
} from '../entities/ingestion-externe.entity';

// Registre "déjà vu" partagé par tous les canaux d'arrivée du Bloc (prescription bloc,
// prescription imagerie, webhook générique d'un autre service). Voir IngestionExterne pour le
// détail des ré-ingestions que ce journal supprime.
@Injectable()
export class IngestionLedgerService {
  private readonly logger = new Logger(IngestionLedgerService.name);

  constructor(
    @InjectRepository(IngestionExterne)
    private readonly repo: Repository<IngestionExterne>,
  ) {}

  async dejaIngeree(
    canal: CanalIngestion,
    referenceExterne?: string | null,
  ): Promise<boolean> {
    if (!referenceExterne) return false;
    const compte = await this.repo.count({
      where: { canal, referenceExterne: String(referenceExterne) },
    });
    return compte > 0;
  }

  // Enregistre l'ingestion. Best-effort et idempotent : deux cycles de polling qui se croisent
  // sur la même prescription doivent laisser passer une ingestion et une seule, sans faire
  // échouer l'appelant sur la violation d'unicité du second (l'essentiel — la fiche patient et la
  // notification — est déjà enregistré à ce stade).
  async marquerIngeree(params: {
    canal: CanalIngestion;
    referenceExterne?: string | null;
    patientId: string;
    serviceSourceId?: string | null;
    libelle?: string | null;
  }): Promise<void> {
    const { canal, referenceExterne, patientId, serviceSourceId, libelle } =
      params;
    if (!referenceExterne) return;
    try {
      await this.repo.insert({
        canal,
        referenceExterne: String(referenceExterne),
        patientId,
        serviceSourceId: serviceSourceId ?? null,
        libelle: libelle ? libelle.slice(0, 255) : null,
      });
    } catch (err) {
      this.logger.warn(
        `Journal d'ingestion : ${canal}/${referenceExterne} déjà enregistré (${(err as Error).message})`,
      );
    }
  }
}
