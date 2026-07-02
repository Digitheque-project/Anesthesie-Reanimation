export declare enum SexeAccueil {
    MALE = "MALE",
    FEMALE = "FEMALE"
}
export declare class RegisterPatientDto {
    nom: string;
    prenom: string;
    sexe: SexeAccueil;
    dateNaissance: string;
    cin?: string;
    profession?: string;
    adresse?: string;
    telephone?: string;
    contactUrgence?: string;
    priseEnChargeId?: string;
}
