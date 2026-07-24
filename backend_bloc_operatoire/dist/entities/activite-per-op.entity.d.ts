import { ConstantePerOp } from './constante-per-op.entity';
export declare class ActivitePerOp {
    id: string;
    patientId: string;
    chirurgienId: string | null;
    anesthesisteId: string | null;
    dateOperation: Date;
    perfusions: string;
    transfusions: string;
    journalSorties: string;
    constantes: ConstantePerOp[];
    intubationOT: boolean;
    sArme: boolean;
    masqueLarynge: boolean;
    ventilation: {
        spontanee: string;
        assistee: string;
        controlee: string;
        peep: string;
        circuitFerme: string;
    };
    etatArrivee: string[];
    createdAt: Date;
    updatedAt: Date;
}
