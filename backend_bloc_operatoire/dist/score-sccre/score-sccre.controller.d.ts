import { ScoreSCCREService } from './score-sccre.service';
import { CreateScoreSCCREDto } from './dto/create-score-sccre.dto';
import { UpdateScoreSCCREDto } from './dto/update-score-sccre.dto';
export declare class ScoreSCCREController {
    private readonly service;
    constructor(service: ScoreSCCREService);
    create(dto: CreateScoreSCCREDto, req: any): Promise<import("../entities").ScoreSCCRE>;
    findAll(p?: number, l?: number): Promise<{
        data: Record<string, any>[];
        total: number;
        page: number;
        pages: number;
    }>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateScoreSCCREDto): Promise<import("../entities").ScoreSCCRE>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
