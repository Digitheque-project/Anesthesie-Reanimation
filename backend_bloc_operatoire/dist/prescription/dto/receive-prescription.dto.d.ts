declare class ItemPrescriptionDto {
    nom: string;
    dosage: string;
    posologie: string;
    duree: number;
}
export declare class ReceivePrescriptionDto {
    idPrescriptionSource: string;
    patientIdSource: string;
    patientId: string;
    type: string;
    items: ItemPrescriptionDto[];
    prescripteur: string;
    datePrescription: string;
    metadata?: any;
}
export {};
