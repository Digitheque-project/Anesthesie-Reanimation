import { MomentsCatalogueService } from './moments-catalogue.service';
import { CreateMomentCatalogueEntryDto } from './dto/create-moment-catalogue-entry.dto';
export declare class MomentsCatalogueController {
    private readonly service;
    constructor(service: MomentsCatalogueService);
    findAll(): Promise<import("../entities/moment-catalogue-entry.entity").MomentCatalogueEntry[]>;
    create(dto: CreateMomentCatalogueEntryDto, req: any): Promise<import("../entities/moment-catalogue-entry.entity").MomentCatalogueEntry>;
}
