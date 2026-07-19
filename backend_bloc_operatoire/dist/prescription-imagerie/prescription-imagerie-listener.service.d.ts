import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { PrescriptionImagerieClient } from '../external/prescription-imagerie.client';
export declare class PrescriptionImagerieListenerService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly prescriptionImagerieClient;
    private readonly notificationRepo;
    private readonly logger;
    private socket;
    private readonly serviceId;
    constructor(config: ConfigService, prescriptionImagerieClient: PrescriptionImagerieClient, notificationRepo: Repository<NotificationCPA>);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private estNotificationPrescription;
    private traiterNotification;
    private ingerer;
}
