import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
import { NotificationBackClient } from '../external/notification-back.client';
import { TracabiliteService } from '../tracabilite/tracabilite.service';
export declare class PatientBlocStatutService {
    private patientBlocRepo;
    private notificationOutgoing;
    private notificationBackClient;
    private tracabiliteService;
    private config;
    private readonly logger;
    private readonly blocServiceId;
    constructor(patientBlocRepo: Repository<PatientBloc>, notificationOutgoing: NotificationOutgoingService, notificationBackClient: NotificationBackClient, tracabiliteService: TracabiliteService, config: ConfigService);
    private diffuserChangementStatut;
    changerStatut(patientId: string, nouveauStatut: PatientStatut, utilisateurId?: string): Promise<PatientBloc>;
    avancerVersEnCoursOperation(patientId: string, utilisateurId?: string): Promise<void>;
    marquerApteCpa(patientId: string, utilisateurId?: string): Promise<PatientBloc>;
    marquerInapteCpa(patientId: string, motifRefus: string, utilisateurId?: string): Promise<PatientBloc>;
    modifierDateIntervention(patientId: string, dateIntervention: string, utilisateurId?: string): Promise<PatientBloc>;
    archiverRetourServiceOrigine(patientId: string, utilisateurId?: string, raison?: 'CPA_NON_CONFORME' | 'FIN_ACTE_ANESTHESIQUE'): Promise<PatientBloc>;
    aSaPropreSalleDeReveil(patientId: string): Promise<boolean>;
}
