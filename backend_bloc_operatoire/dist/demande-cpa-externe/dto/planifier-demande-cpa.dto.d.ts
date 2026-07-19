import { TypeRDV } from '../../entities/creneau-bloc.entity';
export declare class PlanifierDemandeCpaDto {
    type?: TypeRDV;
    date: string;
    heureDebut: string;
    heureFin: string;
    salle: string;
    chirurgienId?: string;
    responsable?: string;
}
