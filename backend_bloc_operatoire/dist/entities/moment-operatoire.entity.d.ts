export declare enum CategorieMoment {
    ANESTHESIE = "ANESTHESIE",
    CHIRURGIE = "CHIRURGIE",
    DIVERS = "DIVERS"
}
export declare class MomentOperatoire {
    id: string;
    patientId: string;
    label: string;
    categorie: CategorieMoment;
    estPersonnalise: boolean;
    horodatage: Date;
    auteurId: string;
    auteurNom: string;
    auteurRole: string;
    annule: boolean;
    annuleLe: Date | null;
    annuleParNom: string | null;
    enregistreLe: Date;
}
