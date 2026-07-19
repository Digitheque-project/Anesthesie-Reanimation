import { MomentsOperatoireService } from './moments-operatoire.service';
import { CreateMomentOperatoireDto } from './dto/create-moment-operatoire.dto';
export declare class MomentsOperatoireController {
    private readonly service;
    constructor(service: MomentsOperatoireService);
    create(dto: CreateMomentOperatoireDto, req: any): Promise<import("../entities").MomentOperatoire>;
    findAll(patientId: string, inclureAnnules?: string): Promise<import("../entities").MomentOperatoire[]>;
    annuler(id: string, req: any): Promise<import("../entities").MomentOperatoire>;
}
