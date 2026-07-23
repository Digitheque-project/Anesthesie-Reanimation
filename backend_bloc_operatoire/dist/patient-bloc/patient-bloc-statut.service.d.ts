import { Repository } from 'typeorm';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
import { NotificationOutgoingService } from '../external/notification-outgoing.service';
export declare class PatientBlocStatutService {
    private patientBlocRepo;
    private notificationOutgoing;
    private readonly logger;
    constructor(patientBlocRepo: Repository<PatientBloc>, notificationOutgoing: NotificationOutgoingService);
    changerStatut(patientId: string, nouveauStatut: PatientStatut): Promise<PatientBloc>;
    avancerVersEnCoursOperation(patientId: string): Promise<void>;
    marquerApteCpa(patientId: string): Promise<PatientBloc>;
    marquerInapteCpa(patientId: string, motifRefus: string): Promise<PatientBloc>;
    modifierDateIntervention(patientId: string, dateIntervention: string): Promise<PatientBloc>;
}
