import { Medecin } from './medecin.entity';
export declare enum StatutCreneau {
    PLANIFIE = "PLANIFIE",
    EN_COURS = "EN_COURS",
    TERMINE = "TERMINE",
    ANNULE = "ANNULE"
}
export declare enum TypeRDV {
    CPA = "CPA",
    VPA = "VPA"
}
export declare class CreneauBloc {
    id: string;
    date: Date;
    heureDebut: string;
    heureFin: string;
    salle: string;
    patientId: string;
    chirurgien: Medecin;
    chirurgienId: string;
    statut: StatutCreneau;
    estUrgence: boolean;
    type: TypeRDV;
    createdAt: Date;
}
