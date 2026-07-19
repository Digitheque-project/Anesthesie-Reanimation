import { StatutChecklist } from '../../entities/checklist-apres-op.entity';
export declare class CreateChecklistApresOpDto {
    patientId: string;
    dateCreation: string;
    interventionEnregistree?: boolean;
    compteFinalCorrect?: boolean;
    etiquetageVerifie?: boolean;
    signalementsEffectues?: boolean;
    transfertSalleReveil?: boolean;
    observationsParticulieres?: string;
    statut?: StatutChecklist;
}
