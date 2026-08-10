import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { PrescriptionExterneClient } from '../external/prescription-externe.client';
import { NotificationBackClient } from '../external/notification-back.client';
import { ServiceRegistryClient } from '../external/service-registry.client';
export declare class PrescriptionService {
    private patientBlocRepo;
    private notificationRepo;
    private prescriptionClient;
    private notificationBackClient;
    private serviceRegistryClient;
    private config;
    private readonly logger;
    private polling;
    constructor(patientBlocRepo: Repository<PatientBloc>, notificationRepo: Repository<NotificationCPA>, prescriptionClient: PrescriptionExterneClient, notificationBackClient: NotificationBackClient, serviceRegistryClient: ServiceRegistryClient, config: ConfigService);
    processPrescription(dto: ReceivePrescriptionDto): Promise<boolean>;
    pollPrescriptionsBloc(): Promise<void>;
    private mapUrgence;
    private extraireDateIntervention;
    private ingerer;
}
