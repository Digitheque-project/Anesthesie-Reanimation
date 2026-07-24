import { VerificationVeilleService } from './verification-veille.service';
import { CreateVerificationVeilleDto } from './dto/create-verification-veille.dto';
import { UpdateVerificationVeilleDto } from './dto/update-verification-veille.dto';
export declare class VerificationVeilleController {
    private readonly service;
    constructor(service: VerificationVeilleService);
    create(d: CreateVerificationVeilleDto): Promise<import("../entities").VerificationVeille>;
    findAll(p?: number, l?: number): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, d: UpdateVerificationVeilleDto): Promise<import("../entities").VerificationVeille>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
