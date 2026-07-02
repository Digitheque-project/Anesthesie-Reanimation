import { Repository } from 'typeorm';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { CreneauBloc } from '../entities/creneau-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
export declare class NotificationAlerteService {
    private notifRepo;
    private patientBlocRepo;
    private creneauRepo;
    private accueilClient;
    constructor(notifRepo: Repository<NotificationCPA>, patientBlocRepo: Repository<PatientBloc>, creneauRepo: Repository<CreneauBloc>, accueilClient: AccueilClient);
    getAlertesUrgentes(): Promise<any>;
    getResumeJour(): Promise<any>;
}
