import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';
export declare class PrescriptionService {
    private readonly logger;
    processPrescription(dto: ReceivePrescriptionDto): Promise<boolean>;
}
