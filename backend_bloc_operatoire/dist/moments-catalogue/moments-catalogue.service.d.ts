import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { MomentCatalogueEntry } from '../entities/moment-catalogue-entry.entity';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateMomentCatalogueEntryDto } from './dto/create-moment-catalogue-entry.dto';
export declare class MomentsCatalogueService implements OnModuleInit {
    private repo;
    private readonly logger;
    constructor(repo: Repository<MomentCatalogueEntry>);
    onModuleInit(): Promise<void>;
    findAll(): Promise<MomentCatalogueEntry[]>;
    create(dto: CreateMomentCatalogueEntryDto, centralUser: CentralUser): Promise<MomentCatalogueEntry>;
}
