import { Repository } from 'typeorm';
import { PatientBloc, PatientStatut } from '../entities/patient-bloc.entity';
export declare class PatientBlocStatutService {
    private patientBlocRepo;
    constructor(patientBlocRepo: Repository<PatientBloc>);
    changerStatut(patientId: string, nouveauStatut: PatientStatut): Promise<PatientBloc>;
}
