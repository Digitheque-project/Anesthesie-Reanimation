import { Repository } from 'typeorm';
import { BonCommandeAnesthesie } from '../entities/bon-commande-anesthesie.entity';
import { ItemCommande } from '../entities/item-commande.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { CreateBonCommandeDto } from './dto/create-bon-commande.dto';
import { UpdateBonCommandeDto } from './dto/update-bon-commande.dto';
export declare class BonCommandeService {
    private bonRepo;
    private itemRepo;
    private accueilClient;
    private medecinIdentiteService;
    constructor(bonRepo: Repository<BonCommandeAnesthesie>, itemRepo: Repository<ItemCommande>, accueilClient: AccueilClient, medecinIdentiteService: MedecinIdentiteService);
    create(dto: CreateBonCommandeDto): Promise<BonCommandeAnesthesie>;
    findAll(page?: number, limite?: number): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateBonCommandeDto): Promise<BonCommandeAnesthesie>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
