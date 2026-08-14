import { NiveauUrgence } from '../entities/patient-bloc.entity';
export declare function niveauDepuisEchelle(urgence?: number | null): NiveauUrgence;
export declare function niveauDepuisLibelle(urgence?: string | number | null): NiveauUrgence;
export declare function estNiveauUrgent(niveau: NiveauUrgence): boolean;
export declare const NIVEAUX_URGENTS: NiveauUrgence[];
