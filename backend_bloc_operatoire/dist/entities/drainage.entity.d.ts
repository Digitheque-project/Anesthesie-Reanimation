import { ProtocoleOperatoire } from './protocole-operatoire.entity';
export declare enum TypeDrainage {
    SONDE_NASO_GASTRIQUE = "SONDE_NASO_GASTRIQUE",
    DRAIN_CRANE = "DRAIN_CRANE",
    DRAIN_THORAX = "DRAIN_THORAX",
    DRAIN_ABDOMEN = "DRAIN_ABDOMEN",
    MEMBRE_SEIN_AUTRES = "MEMBRE_SEIN_AUTRES"
}
export declare enum ModeDrainage {
    SIPHON = "SIPHON",
    ASPIRATION = "ASPIRATION",
    REDON = "REDON"
}
export declare enum CoteDrainage {
    GAUCHE = "GAUCHE",
    DROITE = "DROITE"
}
export declare class Drainage {
    id: string;
    type: TypeDrainage;
    mode: ModeDrainage;
    cote: CoteDrainage;
    protocole: ProtocoleOperatoire;
}
