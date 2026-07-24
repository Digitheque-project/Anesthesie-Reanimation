import { ProtocoleOperatoireService } from './protocole-operatoire.service';
import { CreateProtocoleOperatoireDto } from './dto/create-protocole-operatoire.dto';
import { UpdateProtocoleOperatoireDto } from './dto/update-protocole-operatoire.dto';
export declare class ProtocoleOperatoireController {
    private readonly service;
    constructor(service: ProtocoleOperatoireService);
    create(dto: CreateProtocoleOperatoireDto): Promise<import("../entities").ProtocoleOperatoire>;
    findAll(p?: number, l?: number, patientId?: string): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateProtocoleOperatoireDto): Promise<import("../entities").ProtocoleOperatoire>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
