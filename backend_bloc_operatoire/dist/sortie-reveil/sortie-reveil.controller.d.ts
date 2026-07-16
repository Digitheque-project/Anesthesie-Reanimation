import { SortieReveilService } from './sortie-reveil.service';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';
export declare class SortieReveilController {
    private readonly service;
    constructor(service: SortieReveilService);
    create(dto: CreateSortieReveilDto): Promise<import("../entities").SortieReveil>;
    findAll(p?: number, l?: number): Promise<{
        data: any;
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateSortieReveilDto): Promise<import("../entities").SortieReveil>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
