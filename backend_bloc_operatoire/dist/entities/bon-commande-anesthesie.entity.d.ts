import { VPA } from './vpa.entity';
import { Medecin } from './medecin.entity';
import { ItemCommande } from './item-commande.entity';
export declare enum StatutBonCommande {
    EN_ATTENTE = "EN_ATTENTE",
    VALIDE = "VALIDE"
}
export declare class BonCommandeAnesthesie {
    id: string;
    patientId: string;
    vpa: VPA;
    vpaId: string;
    chirurgien: Medecin;
    chirurgienId: string;
    anesthesiste: Medecin;
    anesthesisteId: string;
    dateCreation: Date;
    items: ItemCommande[];
    consommables: string[];
    statut: StatutBonCommande;
    createdAt: Date;
    updatedAt: Date;
}
