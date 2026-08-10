import { Drainage } from './drainage.entity';
export declare class ProtocoleOperatoire {
    id: string;
    patientId: string;
    dateOperation: Date;
    chirurgienId: string | null;
    anesthesisteId: string | null;
    infirmiereId: string | null;
    aideOperatoireId: string | null;
    compteRenduIntervention: string | null;
    compteRenduAnesthesique: string | null;
    surveillance: {
        ta: {
            coche: boolean;
            valeur: string;
        };
        pouls: {
            coche: boolean;
            valeur: string;
        };
        fr: {
            coche: boolean;
            valeur: string;
        };
        temperature: {
            coche: boolean;
            valeur: string;
        };
        diurese: {
            coche: boolean;
            valeur: string;
        };
        autres: {
            coche: boolean;
            valeur: string;
        };
    };
    drainages: Drainage[];
    prescriptions: {
        perfusionBrasGauche: {
            valeur: string;
            enY: string;
        };
        perfusionBrasDroit: {
            valeur: string;
            enY: string;
        };
        voieCentrale: {
            valeur: string;
            enY: string;
        };
        antibiotiques: string;
        antalgiques: string;
        autres: string;
    };
    prescriptionsConjointes: boolean;
    createdAt: Date;
    updatedAt: Date;
}
