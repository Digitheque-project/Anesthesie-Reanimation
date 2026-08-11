import { Repository } from 'typeorm';
import { FichierVerificationVeille } from '../entities/fichier-verification-veille.entity';
export interface FichierImporte {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
}
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
export declare class FichiersVerificationVeilleService {
    private readonly repo;
    constructor(repo: Repository<FichierVerificationVeille>);
    upload(fichier: FichierImporte | undefined, patientId: string, utilisateurId?: string): Promise<FichierMeta>;
    listerParPatient(patientId: string): Promise<FichierMeta[]>;
    trouverAvecContenu(id: string): Promise<FichierVerificationVeille>;
    supprimer(id: string): Promise<{
        message: string;
    }>;
    rattacher(patientId: string, verificationVeilleId: string): Promise<number>;
}
