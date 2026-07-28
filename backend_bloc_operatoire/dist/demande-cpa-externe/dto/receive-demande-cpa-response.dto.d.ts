import { StatutDemandeCpaExterne } from '../../entities/demande-cpa-externe.entity';
export declare class ReceiveDemandeCpaResponseDto {
    received: boolean;
    id: string;
    statut: StatutDemandeCpaExterne;
    timestamp: string;
}
