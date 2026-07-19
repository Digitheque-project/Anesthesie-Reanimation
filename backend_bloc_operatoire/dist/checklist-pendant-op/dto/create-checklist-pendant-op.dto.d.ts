import { StatutChecklist } from '../../entities/checklist-pendant-op.entity';
export declare class CreateChecklistPendantOpDto {
    patientId: string;
    dateCreation: string;
    identiteUltimeConfirmee?: boolean;
    interventionConfirmee?: boolean;
    siteOperatoireConfirme?: boolean;
    installationCorrecte?: boolean;
    documentsDisponibles?: boolean;
    antibioprophylaxieFaite?: boolean;
    constantesStables?: boolean;
    ventilationOK?: boolean;
    statut?: StatutChecklist;
}
