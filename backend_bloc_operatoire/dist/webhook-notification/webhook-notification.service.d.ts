import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { WebhookNotification } from '../entities/webhook-notification.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { IngestionLedgerService } from '../ingestion/ingestion-ledger.service';
import { ServiceRegistryClient } from '../external/service-registry.client';
import { NotificationBackClient } from '../external/notification-back.client';
export declare class WebhookNotificationService {
    private readonly webhookRepo;
    private readonly patientBlocRepo;
    private readonly notificationRepo;
    private readonly ingestionLedger;
    private readonly serviceRegistryClient;
    private readonly notificationBackClient;
    private readonly config;
    private readonly logger;
    private readonly blocServiceId;
    constructor(webhookRepo: Repository<WebhookNotification>, patientBlocRepo: Repository<PatientBloc>, notificationRepo: Repository<NotificationCPA>, ingestionLedger: IngestionLedgerService, serviceRegistryClient: ServiceRegistryClient, notificationBackClient: NotificationBackClient, config: ConfigService);
    processIncomingNotification(payload: any, sourceService?: string): Promise<boolean>;
    private admettrePatient;
}
