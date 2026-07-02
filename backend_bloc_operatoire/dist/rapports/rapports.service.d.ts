import { Repository } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { Medecin } from '../entities/medecin.entity';
import { CPA } from '../entities/cpa.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { AccueilClient } from '../external/accueil.client';
export declare class RapportsService {
    private patientBlocRepo;
    private activiteRepo;
    private scoreRepo;
    private medecinRepo;
    private cpaRepository;
    private notifRepo;
    private accueilClient;
    constructor(patientBlocRepo: Repository<PatientBloc>, activiteRepo: Repository<ActivitePerOp>, scoreRepo: Repository<ScoreSCCRE>, medecinRepo: Repository<Medecin>, cpaRepository: Repository<CPA>, notifRepo: Repository<NotificationCPA>, accueilClient: AccueilClient);
    statistiquesGenerales(dateDebut?: string, dateFin?: string): Promise<{
        totalPatients: number;
        totalOperations: number;
        totalUrgences: number;
        totalScores: number;
        totalMedecins: number;
        patientsParStatut: any[];
        urgencesParNiveau: any[];
    }>;
    activiteParChirurgien(dateDebut?: string, dateFin?: string): Promise<any[]>;
    cpaEnAttente(): Promise<(NotificationCPA & {
        patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
    })[]>;
    tauxOccupation(periode?: string): Promise<any[]>;
    exportStatistiques(type: string, dateDebut?: string, dateFin?: string): Promise<{
        type: string;
        genereLe: string;
        statistiques: {
            totalPatients: number;
            totalOperations: number;
            totalUrgences: number;
            totalScores: number;
            totalMedecins: number;
            patientsParStatut: any[];
            urgencesParNiveau: any[];
        };
        activiteParChirurgien: any[];
    }>;
}
