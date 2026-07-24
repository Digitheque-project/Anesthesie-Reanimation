import { Repository } from 'typeorm';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';
export declare class SortieReveilService {
    private repo;
    private accueilClient;
    private medecinIdentiteService;
    constructor(repo: Repository<SortieReveil>, accueilClient: AccueilClient, medecinIdentiteService: MedecinIdentiteService);
    create(dto: CreateSortieReveilDto, centralUser: CentralUser): Promise<SortieReveil>;
    findAll(page?: number, limite?: number): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateSortieReveilDto): Promise<SortieReveil>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
