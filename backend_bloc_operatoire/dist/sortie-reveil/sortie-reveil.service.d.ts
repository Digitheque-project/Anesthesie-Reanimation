import { Repository } from 'typeorm';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinService } from '../medecin/medecin.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';
export declare class SortieReveilService {
    private repo;
    private accueilClient;
    private medecinService;
    constructor(repo: Repository<SortieReveil>, accueilClient: AccueilClient, medecinService: MedecinService);
    create(dto: CreateSortieReveilDto, centralUser: CentralUser): Promise<SortieReveil>;
    findAll(page?: number, limite?: number): Promise<{
        data: any;
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
