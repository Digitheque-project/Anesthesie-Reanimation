export declare class ReceiveNotificationDto {
    type: string;
    motif: string;
    sourceServiceId: string;
    sourceServiceName: string;
    targetServiceId: string;
    targetServiceName: string;
    urgence: number;
    patientId: string;
    payload: any;
    channels: string[];
}
