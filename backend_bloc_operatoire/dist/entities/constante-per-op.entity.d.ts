import { ActivitePerOp } from './activite-per-op.entity';
export declare class ConstantePerOp {
    id: string;
    heure: string;
    horodatage: Date | null;
    fc: number;
    ta: string;
    spo2: number;
    temperature: number;
    capnie: number;
    score: number;
    activitePerOp: ActivitePerOp;
}
