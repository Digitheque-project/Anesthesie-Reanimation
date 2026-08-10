import { Repository } from 'typeorm';
import { CreneauBloc } from '../entities/creneau-bloc.entity';
export declare function verifierCreneauValide(creneauRepo: Repository<CreneauBloc>, date: string, heureDebut: string): Promise<void>;
