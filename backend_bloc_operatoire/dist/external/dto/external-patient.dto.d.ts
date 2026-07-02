export interface ExternalPatient {
    id: string;
    nom: string;
    prenom: string;
    sexe: 'MALE' | 'FEMALE';
    dateNaissance: string;
    cin?: string | null;
    profession?: string | null;
    adresse?: string | null;
    telephone?: string | null;
    contactUrgence?: string | null;
    chuId: string;
    priseEnChargeId?: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}
