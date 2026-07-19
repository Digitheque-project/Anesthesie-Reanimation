import { Repository } from 'typeorm';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateChecklistPendantOpDto } from './dto/create-checklist-pendant-op.dto';
import { UpdateChecklistPendantOpDto } from './dto/update-checklist-pendant-op.dto';
export declare class ChecklistPendantOpService {
    private repo;
    private accueilClient;
    private gateway;
    private patientBlocStatutService;
    constructor(repo: Repository<ChecklistPendantOp>, accueilClient: AccueilClient, gateway: OperationGateway, patientBlocStatutService: PatientBlocStatutService);
    create(dto: CreateChecklistPendantOpDto, centralUser: CentralUser): Promise<ChecklistPendantOp>;
    findAll(patientId?: string): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, dto: UpdateChecklistPendantOpDto): Promise<ChecklistPendantOp>;
}
