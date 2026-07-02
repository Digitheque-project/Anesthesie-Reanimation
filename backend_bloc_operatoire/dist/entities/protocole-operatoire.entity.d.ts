import { Medecin } from './medecin.entity';
import { Drainage } from './drainage.entity';
export declare class ProtocoleOperatoire {
    id: string;
    patientId: string;
    dateOperation: Date;
    chirurgien: Medecin;
    chirurgienId: string;
    anesthesiste: Medecin;
    anesthesisteId: string;
    infirmiere: Medecin;
    infirmiereId: string;
    aideOperatoire: Medecin;
    aideOperatoireId: string;
    compteRenduIntervention: string;
    surveillance: {
        ta: string;
        pouls: string;
        fr: string;
        temperature: string;
        diurèse: string;
        autres: string;
    };
    drainages: Drainage[];
    prescriptions: {
        perfusionBrasGauche: boolean;
        perfusionBrasDroit: boolean;
        voieCentrale: boolean;
        antibiotiques: string;
        antalgiques: string;
        autres: string;
    };
    prescriptionsConjointes: boolean;
    createdAt: Date;
    updatedAt: Date;
}
