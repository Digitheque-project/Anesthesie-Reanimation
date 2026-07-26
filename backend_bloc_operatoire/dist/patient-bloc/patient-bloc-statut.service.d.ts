import { Repository } from 'typeorm';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
import { TracabiliteService } from '../tracabilite/tracabilite.service';
export declare class PatientBlocStatutService {
    private patientBlocRepo;
    private notificationOutgoing;
    private tracabiliteService;
    private readonly logger;
    constructor(patientBlocRepo: Repository<PatientBloc>, notificationOutgoing: NotificationOutgoingService, tracabiliteService: TracabiliteService);
    changerStatut(patientId: string, nouveauStatut: PatientStatut, utilisateurId?: string): Promise<PatientBloc>;
    avancerVersEnCoursOperation(patientId: string, utilisateurId?: string): Promise<void>;
    marquerApteCpa(patientId: string, utilisateurId?: string): Promise<PatientBloc>;
    marquerInapteCpa(patientId: string, motifRefus: string, utilisateurId?: string): Promise<PatientBloc>;
    modifierDateIntervention(patientId: string, dateIntervention: string, utilisateurId?: string): Promise<PatientBloc>;
}
