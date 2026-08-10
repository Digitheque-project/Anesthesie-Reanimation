import { PlanningService } from './planning.service';
import { TypeRDV } from '../entities/creneau-bloc.entity';
export declare class PlanningController {
    private readonly service;
    constructor(service: PlanningService);
    getJour(date: string, type?: TypeRDV): Promise<any[]>;
    getSemaine(debut: string, fin: string, type?: TypeRDV): Promise<any[]>;
    reserver(dto: any): Promise<import("../entities/creneau-bloc.entity").CreneauBloc[]>;
    annuler(id: string): Promise<import("../entities/creneau-bloc.entity").CreneauBloc>;
    urgences(): Promise<any[]>;
    cpaAVenir(): Promise<any[]>;
}
