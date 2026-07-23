import { Repository } from 'typeorm';
import { Medecin } from '../entities/medecin.entity';
import { CreateMedecinDto } from './dto/create-medecin.dto';
import { UpdateMedecinDto } from './dto/update-medecin.dto';
export declare class MedecinService {
    private medecinRepository;
    constructor(medecinRepository: Repository<Medecin>);
    create(createMedecinDto: CreateMedecinDto): Promise<Medecin>;
    findAll(filters?: {
        role?: string;
        recherche?: string;
        page?: number;
        limite?: number;
    }): Promise<{
        data: Medecin[];
        total: number;
        page: number;
        pages: number;
    }>;
    findByEmail(email: string): Promise<Medecin | null>;
    findOne(id: string): Promise<Medecin>;
    update(id: string, updateMedecinDto: UpdateMedecinDto): Promise<Medecin>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
