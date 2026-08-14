import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { PrescriptionExterneClient } from '../external/prescription-externe.client';
import { NotificationBackClient } from '../external/notification-back.client';
import { ServiceRegistryClient } from '../external/service-registry.client';
import { IngestionLedgerService } from '../ingestion/ingestion-ledger.service';
export declare class PrescriptionService {
    private patientBlocRepo;
    private notificationRepo;
    private prescriptionClient;
    private notificationBackClient;
    private serviceRegistryClient;
    private ingestionLedger;
    private config;
    private readonly logger;
    private polling;
    private dernierPoll;
    constructor(patientBlocRepo: Repository<PatientBloc>, notificationRepo: Repository<NotificationCPA>, prescriptionClient: PrescriptionExterneClient, notificationBackClient: NotificationBackClient, serviceRegistryClient: ServiceRegistryClient, ingestionLedger: IngestionLedgerService, config: ConfigService);
    processPrescription(dto: ReceivePrescriptionDto): Promise<boolean>;
    pollPrescriptionsBloc(): Promise<void>;
    private extraireDateIntervention;
    private libelleComplet;
    private champPrescription;
    private dureeEnMinutes;
    private ingerer;
}
