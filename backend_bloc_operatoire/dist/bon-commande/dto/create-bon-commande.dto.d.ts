import { StatutBonCommande } from '../../entities/bon-commande-anesthesie.entity';
declare class ItemDto {
    nom: string;
    selectionne: boolean;
    quantite?: string;
    dosage?: string;
    observation?: string;
}
export declare class CreateBonCommandeDto {
    patientId: string;
    verificationVeilleId?: string;
    chirurgienId?: string;
    anesthesisteId?: string;
    dateCreation: string;
    items?: ItemDto[];
    consommables?: string[];
    statut?: StatutBonCommande;
}
export {};
