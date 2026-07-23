import { TypeDrainage, ModeDrainage, CoteDrainage } from '../../entities/drainage.entity';
declare class DrainageDto {
    type: TypeDrainage;
    mode: ModeDrainage;
    cote?: CoteDrainage;
}
export declare class CreateProtocoleOperatoireDto {
    patientId: string;
    dateOperation: string;
    chirurgienId?: string;
    anesthesisteId?: string;
    infirmiereId?: string;
    aideOperatoireId?: string;
    compteRenduIntervention: string;
    surveillance?: any;
    drainages?: DrainageDto[];
    prescriptions?: any;
    prescriptionsConjointes: boolean;
}
export {};
