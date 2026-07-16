import { VPAService } from './vpa.service';
import { CreateVPADto } from './dto/create-vpa.dto';
import { UpdateVPADto } from './dto/update-vpa.dto';
export declare class VPAController {
    private readonly service;
    constructor(service: VPAService);
    create(d: CreateVPADto): Promise<import("../entities").VPA>;
    findAll(p?: number, l?: number): Promise<{
        data: any;
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, d: UpdateVPADto): Promise<import("../entities").VPA>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
