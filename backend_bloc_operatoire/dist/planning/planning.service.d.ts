import { Repository } from 'typeorm';
import { CreneauBloc, TypeRDV } from '../entities/creneau-bloc.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
export declare class PlanningService {
    private creneauRepo;
    private patientBlocRepo;
    private accueilClient;
    constructor(creneauRepo: Repository<CreneauBloc>, patientBlocRepo: Repository<PatientBloc>, accueilClient: AccueilClient);
    getPlanningJour(jour: string, type?: TypeRDV): Promise<any>;
    getPlanningSemaine(debut: string, fin: string, type?: TypeRDV): Promise<any>;
    reserverCreneau(dto: any): Promise<CreneauBloc[]>;
    annulerCreneau(id: string): Promise<CreneauBloc>;
    getUrgencesEnAttente(): Promise<any>;
    transfererCpaVersVpa(dto: {
        patientId: string;
        chirurgienId: string;
        dateVPA: string;
        heureDebut: string;
        salle: string;
    }): Promise<CreneauBloc>;
    transfererVpaVersPatientJour(dto: {
        patientId: string;
        chirurgienId: string;
        date: string;
        heureDebut: string;
        salle: string;
    }): Promise<CreneauBloc>;
}
