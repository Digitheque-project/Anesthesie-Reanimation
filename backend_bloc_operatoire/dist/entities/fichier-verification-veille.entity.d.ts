export declare class FichierVerificationVeille {
    id: string;
    patientId: string;
    verificationVeilleId: string | null;
    nomOriginal: string;
    mimeType: string;
    tailleOctets: number;
    contenu: Buffer;
    telechargeParId: string | null;
    createdAt: Date;
    updatedAt: Date;
}
