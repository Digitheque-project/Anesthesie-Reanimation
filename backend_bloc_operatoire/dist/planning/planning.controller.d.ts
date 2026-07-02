import { PlanningService } from './planning.service';
import { TypeRDV } from '../entities/creneau-bloc.entity';
export declare class PlanningController {
    private readonly service;
    constructor(service: PlanningService);
    getJour(date: string, type?: TypeRDV): Promise<(import("../entities/creneau-bloc.entity").CreneauBloc & {
        patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
    })[]>;
    getSemaine(debut: string, fin: string, type?: TypeRDV): Promise<(import("../entities/creneau-bloc.entity").CreneauBloc & {
        patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
    })[]>;
    reserver(dto: any): Promise<import("../entities/creneau-bloc.entity").CreneauBloc[]>;
    annuler(id: string): Promise<import("../entities/creneau-bloc.entity").CreneauBloc>;
    urgences(): Promise<(import("../entities/creneau-bloc.entity").CreneauBloc & {
        patient: import("../external/dto/external-patient.dto").ExternalPatient | null;
    })[]>;
    transfererCpaVersVpa(dto: {
        patientId: string;
        chirurgienId: string;
        dateVPA: string;
        heureDebut: string;
        salle: string;
    }): Promise<import("../entities/creneau-bloc.entity").CreneauBloc>;
    transfererVpaVersPatientJour(dto: {
        patientId: string;
        chirurgienId: string;
        date: string;
        heureDebut: string;
        salle: string;
    }): Promise<import("../entities/creneau-bloc.entity").CreneauBloc>;
}
