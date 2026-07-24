import { Repository } from 'typeorm';
import { PatientBloc } from '../entities/patient-bloc.entity';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { Medecin } from '../entities/medecin.entity';
import { CPA } from '../entities/cpa.entity';
import { NotificationCPA } from '../entities/notification-cpa.entity';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { MomentOperatoire } from '../entities/moment-operatoire.entity';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
export declare class RapportsService {
    private patientBlocRepo;
    private activiteRepo;
    private scoreRepo;
    private medecinRepo;
    private cpaRepository;
    private notifRepo;
    private sortieRepo;
    private checklistAvantRepo;
    private checklistPendantRepo;
    private checklistApresRepo;
    private momentRepo;
    private protocoleRepo;
    private accueilClient;
    private medecinIdentiteService;
    constructor(patientBlocRepo: Repository<PatientBloc>, activiteRepo: Repository<ActivitePerOp>, scoreRepo: Repository<ScoreSCCRE>, medecinRepo: Repository<Medecin>, cpaRepository: Repository<CPA>, notifRepo: Repository<NotificationCPA>, sortieRepo: Repository<SortieReveil>, checklistAvantRepo: Repository<ChecklistAvantOp>, checklistPendantRepo: Repository<ChecklistPendantOp>, checklistApresRepo: Repository<ChecklistApresOp>, momentRepo: Repository<MomentOperatoire>, protocoleRepo: Repository<ProtocoleOperatoire>, accueilClient: AccueilClient, medecinIdentiteService: MedecinIdentiteService);
    statistiquesGenerales(dateDebut?: string, dateFin?: string): Promise<{
        totalPatients: number;
        totalPatientsActifs: number;
        totalOperations: number;
        totalUrgences: number;
        totalScores: number;
        totalMedecins: number;
        patientsParStatut: any[];
        urgencesParNiveau: any[];
    }>;
    activiteParChirurgien(dateDebut?: string, dateFin?: string): Promise<any[]>;
    activiteParAnesthesiste(dateDebut?: string, dateFin?: string): Promise<{
        medecinId: string;
        nomComplet: string;
        nbCPA: number;
        nbOperations: number;
        nbScoresSCCRE: number;
    }[]>;
    decisionsCPA(dateDebut?: string, dateFin?: string): Promise<any[]>;
    typesChirurgie(): Promise<any[]>;
    tachesAccomplies(dateDebut?: string, dateFin?: string): Promise<{
        checklistsAvantOp: number;
        checklistsPendantOp: number;
        checklistsApresOp: number;
        momentsOperatoires: number;
        comptesRendusOperatoires: number;
    }>;
    cpaEnAttente(): Promise<Record<string, any>[]>;
    tauxOccupation(dateDebut?: string, dateFin?: string): Promise<any[]>;
    operationsDetail(dateDebut?: string, dateFin?: string, limite?: number): Promise<{
        patientNom: string;
        libelle: any;
        typeChirurgie: any;
        niveauUrgence: any;
        statut: any;
        dateOperation: Date;
        chirurgien: string;
        anesthesiste: string;
        compteRenduDisponible: boolean;
    }[]>;
    tableauDeBord(dateDebut?: string, dateFin?: string): Promise<{
        periode: {
            dateDebut: string | null;
            dateFin: string | null;
        };
        genereLe: string;
        statistiques: {
            totalSortiesReveil: number;
            totalPatients: number;
            totalPatientsActifs: number;
            totalOperations: number;
            totalUrgences: number;
            totalScores: number;
            totalMedecins: number;
            patientsParStatut: any[];
            urgencesParNiveau: any[];
        };
        activiteParChirurgien: any[];
        activiteParAnesthesiste: {
            medecinId: string;
            nomComplet: string;
            nbCPA: number;
            nbOperations: number;
            nbScoresSCCRE: number;
        }[];
        decisionsCPA: any[];
        typesChirurgie: any[];
        tachesAccomplies: {
            checklistsAvantOp: number;
            checklistsPendantOp: number;
            checklistsApresOp: number;
            momentsOperatoires: number;
            comptesRendusOperatoires: number;
        };
        evolutionQuotidienne: any[];
        operationsDetail: {
            patientNom: string;
            libelle: any;
            typeChirurgie: any;
            niveauUrgence: any;
            statut: any;
            dateOperation: Date;
            chirurgien: string;
            anesthesiste: string;
            compteRenduDisponible: boolean;
        }[];
    }>;
    exportStatistiques(type: string, dateDebut?: string, dateFin?: string): Promise<{
        periode: {
            dateDebut: string | null;
            dateFin: string | null;
        };
        genereLe: string;
        statistiques: {
            totalSortiesReveil: number;
            totalPatients: number;
            totalPatientsActifs: number;
            totalOperations: number;
            totalUrgences: number;
            totalScores: number;
            totalMedecins: number;
            patientsParStatut: any[];
            urgencesParNiveau: any[];
        };
        activiteParChirurgien: any[];
        activiteParAnesthesiste: {
            medecinId: string;
            nomComplet: string;
            nbCPA: number;
            nbOperations: number;
            nbScoresSCCRE: number;
        }[];
        decisionsCPA: any[];
        typesChirurgie: any[];
        tachesAccomplies: {
            checklistsAvantOp: number;
            checklistsPendantOp: number;
            checklistsApresOp: number;
            momentsOperatoires: number;
            comptesRendusOperatoires: number;
        };
        evolutionQuotidienne: any[];
        operationsDetail: {
            patientNom: string;
            libelle: any;
            typeChirurgie: any;
            niveauUrgence: any;
            statut: any;
            dateOperation: Date;
            chirurgien: string;
            anesthesiste: string;
            compteRenduDisponible: boolean;
        }[];
    }>;
}
