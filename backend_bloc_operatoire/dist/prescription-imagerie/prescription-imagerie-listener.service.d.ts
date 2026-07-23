import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { PrescriptionImagerieClient } from '../external/prescription-imagerie.client';
import { PrescriptionService } from '../prescription/prescription.service';
export declare class PrescriptionImagerieListenerService implements OnModuleInit, OnModuleDestroy {
    private readonly config;
    private readonly prescriptionImagerieClient;
    private readonly prescriptionService;
    private readonly notificationRepo;
    private readonly logger;
    private socket;
    private readonly serviceId;
    constructor(config: ConfigService, prescriptionImagerieClient: PrescriptionImagerieClient, prescriptionService: PrescriptionService, notificationRepo: Repository<NotificationCPA>);
    onModuleInit(): void;
    onModuleDestroy(): void;
    private estNotificationPrescription;
    private traiterNotification;
    private ingerer;
}
