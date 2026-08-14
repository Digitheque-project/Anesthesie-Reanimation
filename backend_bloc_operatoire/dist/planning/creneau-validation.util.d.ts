import { Repository } from 'typeorm';
import { CreneauBloc, TypeRDV } from '../entities/creneau-bloc.entity';
export declare function verifierCreneauValide(creneauRepo: Repository<CreneauBloc>, date: string, heureDebut: string, type?: TypeRDV): Promise<void>;
