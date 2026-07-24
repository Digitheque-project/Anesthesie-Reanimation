import { Repository } from 'typeorm';
import { CreneauBloc, TypeRDV } from '../entities/creneau-bloc.entity';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
export declare class PlanningService {
    private creneauRepo;
    private patientBlocRepo;
    private accueilClient;
    private medecinIdentiteService;
    constructor(creneauRepo: Repository<CreneauBloc>, patientBlocRepo: Repository<PatientBloc>, accueilClient: AccueilClient, medecinIdentiteService: MedecinIdentiteService);
    private enrichCreneaux;
    getPlanningJour(jour: string, type?: TypeRDV): Promise<any[]>;
    getPlanningSemaine(debut: string, fin: string, type?: TypeRDV): Promise<any[]>;
    reserverCreneau(dto: any): Promise<CreneauBloc[]>;
    annulerCreneau(id: string): Promise<CreneauBloc>;
    getUrgencesEnAttente(): Promise<any[]>;
    transfererCpaVersVerificationVeille(dto: {
        patientId: string;
        chirurgienId: string;
        dateVerificationVeille: string;
        heureDebut: string;
        salle: string;
    }): Promise<CreneauBloc>;
    transfererVerificationVeilleVersPatientJour(dto: {
        patientId: string;
        chirurgienId: string;
        date: string;
        heureDebut: string;
        salle: string;
    }): Promise<CreneauBloc>;
}
