import { Repository } from 'typeorm';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { AccueilClient } from '../external/accueil.client';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';
export declare class SortieReveilService {
    private repo;
    private accueilClient;
    constructor(repo: Repository<SortieReveil>, accueilClient: AccueilClient);
    create(dto: CreateSortieReveilDto): Promise<SortieReveil>;
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
