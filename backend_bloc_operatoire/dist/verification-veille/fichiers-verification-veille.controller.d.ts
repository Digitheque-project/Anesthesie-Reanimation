import { FichiersVerificationVeilleService } from './fichiers-verification-veille.service';
import type { FichierImporte } from './fichiers-verification-veille.service';
export declare class FichiersVerificationVeilleController {
    private readonly service;
    constructor(service: FichiersVerificationVeilleService);
    upload(fichier: FichierImporte, patientId: string, req: any): Promise<import("./fichiers-verification-veille.service").FichierMeta>;
    lister(patientId: string): Promise<import("./fichiers-verification-veille.service").FichierMeta[]>;
    contenu(id: string): Promise<{
        id: string;
        nomOriginal: string;
        mimeType: string;
        base64: string;
    }>;
    supprimer(id: string): Promise<{
        message: string;
    }>;
}
