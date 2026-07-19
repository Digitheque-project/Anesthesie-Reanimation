import { Repository } from 'typeorm';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateChecklistApresOpDto } from './dto/create-checklist-apres-op.dto';
import { UpdateChecklistApresOpDto } from './dto/update-checklist-apres-op.dto';
export declare class ChecklistApresOpService {
    private repo;
    private accueilClient;
    private gateway;
    private patientBlocStatutService;
    constructor(repo: Repository<ChecklistApresOp>, accueilClient: AccueilClient, gateway: OperationGateway, patientBlocStatutService: PatientBlocStatutService);
    create(dto: CreateChecklistApresOpDto, centralUser: CentralUser): Promise<ChecklistApresOp>;
    findAll(patientId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateChecklistApresOpDto): Promise<ChecklistApresOp>;
}
