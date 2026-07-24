import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateChecklistPendantOpDto } from './dto/create-checklist-pendant-op.dto';
import { UpdateChecklistPendantOpDto } from './dto/update-checklist-pendant-op.dto';

@Injectable()
export class ChecklistPendantOpService {
  constructor(
    @InjectRepository(ChecklistPendantOp)
    private repo: Repository<ChecklistPendantOp>,
    private accueilClient: AccueilClient,
    private gateway: OperationGateway,
    private patientBlocStatutService: PatientBlocStatutService,
  ) {}

  async create(
    dto: CreateChecklistPendantOpDto,
    centralUser: CentralUser,
  ): Promise<ChecklistPendantOp> {
    const saved = await this.repo.save(
      this.repo.create({
        ...dto,
        validateurId: centralUser.userId,
        validateurNom: `${centralUser.prenom} ${centralUser.nom}`.trim(),
        validateurRole: centralUser.role,
      }),
    );
    // Le Time Out marque dans les faits le vrai début de l'opération.
    await this.patientBlocStatutService.avancerVersEnCoursOperation(
      saved.patientId,
    );
    return saved;
  }

  async findAll(patientId?: string) {
    const data = await this.repo.find({
      where: patientId ? { patientId } : {},
    });
    return this.accueilClient.enrichWithIdentity(data);
  }

  async findOne(id: string) {
    const checklist = await this.repo.findOne({ where: { id } });
    if (!checklist)
      throw new NotFoundException(
        `Checklist pendant opération ${id} non trouvée`,
      );
    const [enriched] = await this.accueilClient.enrichWithIdentity([checklist]);
    return enriched;
  }

  async update(
    id: string,
    dto: UpdateChecklistPendantOpDto,
  ): Promise<ChecklistPendantOp> {
    const checklist = await this.repo.findOne({ where: { id } });
    if (!checklist)
      throw new NotFoundException(
        `Checklist pendant opération ${id} non trouvée`,
      );
    const updated = await this.repo.save(Object.assign(checklist, dto));
    this.gateway.emitToOperation(
      updated.patientId,
      'checklist-pendant-op:maj',
      { patientId: updated.patientId, checklist: updated },
    );
    return updated;
  }
}
