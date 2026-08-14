export declare enum CanalIngestion {
    PRESCRIPTION_BLOC = "PRESCRIPTION_BLOC",
    PRESCRIPTION_IMAGERIE = "PRESCRIPTION_IMAGERIE",
    WEBHOOK_SERVICE = "WEBHOOK_SERVICE"
}
export declare class IngestionExterne {
    id: string;
    canal: CanalIngestion;
    referenceExterne: string;
    patientId: string;
    serviceSourceId: string | null;
    libelle: string | null;
    ingereeLe: Date;
}
