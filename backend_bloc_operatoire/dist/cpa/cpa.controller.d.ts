import { CPAService } from './cpa.service';
import { CreateCPADto } from './dto/create-cpa.dto';
import { UpdateCPADto } from './dto/update-cpa.dto';
export declare class CPAController {
    private readonly service;
    constructor(service: CPAService);
    create(d: CreateCPADto, req: any): Promise<import("../entities").CPA>;
    findAll(p?: number, l?: number, patientId?: string): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, d: UpdateCPADto): Promise<import("../entities").CPA>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
