import { PrescriptionService } from './prescription.service';
import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';
export declare class PrescriptionController {
    private readonly service;
    private readonly logger;
    constructor(service: PrescriptionService);
    receivePrescription(dto: ReceivePrescriptionDto): Promise<{
        received: boolean;
        processed: boolean;
        timestamp: string;
    }>;
}
