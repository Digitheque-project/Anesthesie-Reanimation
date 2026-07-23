export declare class ReceiveDemandeCpaDto {
    patientId: string;
    sourceServiceId: string;
    sourceServiceName?: string;
    sourceCallbackUrl?: string;
    sourceReferenceType: string;
    sourceReferenceId: string;
    typeAnesthesie: string;
    motif?: string;
    urgence?: number;
    dateExamenSouhaitee?: string;
}
