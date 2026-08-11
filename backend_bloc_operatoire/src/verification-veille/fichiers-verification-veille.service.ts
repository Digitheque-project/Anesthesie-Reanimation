import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { FichierVerificationVeille } from '../entities/fichier-verification-veille.entity';

// Les types multer (@types/multer) ne sont pas installés : on décrit juste les champs du
// fichier que FileInterceptor(memoryStorage) place dans @UploadedFile().
export interface FichierImporte {
  originalname: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

// Métadonnées exposées au frontend (sans le contenu binaire, renvoyé à la demande).
export interface FichierMeta {
  id: string;
  patientId: string;
  verificationVeilleId: string | null;
  nomOriginal: string;
  mimeType: string;
  tailleOctets: number;
  telechargeParId: string | null;
  createdAt: Date;
}

function sansContenu(fichier: FichierVerificationVeille): FichierMeta {
  return {
    id: fichier.id,
    patientId: fichier.patientId,
    verificationVeilleId: fichier.verificationVeilleId,
    nomOriginal: fichier.nomOriginal,
    mimeType: fichier.mimeType,
    tailleOctets: fichier.tailleOctets,
    telechargeParId: fichier.telechargeParId,
    createdAt: fichier.createdAt,
  };
}

@Injectable()
export class FichiersVerificationVeilleService {
  constructor(
    @InjectRepository(FichierVerificationVeille)
    private readonly repo: Repository<FichierVerificationVeille>,
  ) {}

  async upload(
    fichier: FichierImporte | undefined,
    patientId: string,
    utilisateurId?: string,
  ): Promise<FichierMeta> {
    if (!fichier || !fichier.buffer || fichier.buffer.length === 0) {
      throw new BadRequestException('Fichier vide ou invalide.');
    }
    const saved = await this.repo.save(
      this.repo.create({
        patientId,
        nomOriginal: fichier.originalname || 'fichier',
        mimeType: fichier.mimetype || 'application/octet-stream',
        tailleOctets: fichier.size || fichier.buffer.length,
        contenu: fichier.buffer,
        telechargeParId: utilisateurId ?? null,
      }),
    );
    return sansContenu(saved);
  }

  async listerParPatient(patientId: string): Promise<FichierMeta[]> {
    if (!patientId) {
      throw new BadRequestException('patientId requis.');
    }
    const fichiers = await this.repo.find({
      where: { patientId },
      order: { createdAt: 'DESC' },
    });
    return fichiers.map(sansContenu);
  }

  async trouverAvecContenu(id: string): Promise<FichierVerificationVeille> {
    const fichier = await this.repo.findOne({ where: { id } });
    if (!fichier) {
      throw new NotFoundException(`Pièce jointe ${id} introuvable.`);
    }
    return fichier;
  }

  async supprimer(id: string): Promise<{ message: string }> {
    const fichier = await this.repo.findOne({ where: { id } });
    if (!fichier) {
      throw new NotFoundException(`Pièce jointe ${id} introuvable.`);
    }
    await this.repo.delete(id);
    return { message: 'Pièce jointe supprimée.' };
  }

  // Après validation de la vérification veille, rattache tous les fichiers du patient à
  // l'enregistrement pour que « les fichiers suivent les informations cochées ». Renvoie le
  // nombre de fichiers rattachés.
  async rattacher(
    patientId: string,
    verificationVeilleId: string,
  ): Promise<number> {
    const resultat = await this.repo.update(
      { patientId, verificationVeilleId: IsNull() },
      { verificationVeilleId },
    );
    return resultat.affected ?? 0;
  }
}
