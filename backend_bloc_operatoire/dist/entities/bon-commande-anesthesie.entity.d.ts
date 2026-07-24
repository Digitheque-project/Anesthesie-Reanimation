import { VerificationVeille } from './verification-veille.entity';
import { ItemCommande } from './item-commande.entity';
export declare enum StatutBonCommande {
    EN_ATTENTE = "EN_ATTENTE",
    VALIDE = "VALIDE"
}
export declare class BonCommandeAnesthesie {
    id: string;
    patientId: string;
    verificationVeille: VerificationVeille;
    verificationVeilleId: string;
    chirurgienId: string;
    anesthesisteId: string;
    dateCreation: Date;
    items: ItemCommande[];
    consommables: string[];
    statut: StatutBonCommande;
    createdAt: Date;
    updatedAt: Date;
}
