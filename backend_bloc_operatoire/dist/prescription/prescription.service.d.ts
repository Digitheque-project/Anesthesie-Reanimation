import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { PrescriptionExterneClient } from '../external/prescription-externe.client';
import { NotificationBackClient } from '../external/notification-back.client';
export declare class PrescriptionService {
    private patientBlocRepo;
    private notificationRepo;
    private prescriptionClient;
    private notificationBackClient;
    private config;
    private readonly logger;
    private polling;
    constructor(patientBlocRepo: Repository<PatientBloc>, notificationRepo: Repository<NotificationCPA>, prescriptionClient: PrescriptionExterneClient, notificationBackClient: NotificationBackClient, config: ConfigService);
    processPrescription(dto: ReceivePrescriptionDto): Promise<boolean>;
    pollPrescriptionsBloc(): Promise<void>;
    private mapUrgence;
    private ingerer;
}
