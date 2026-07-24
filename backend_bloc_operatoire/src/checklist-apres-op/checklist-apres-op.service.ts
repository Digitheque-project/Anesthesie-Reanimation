import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { PatientStatut } from '../entities/patient-bloc.entity';
import { AccueilClient } from '../external/accueil.client';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { CreateChecklistApresOpDto } from './dto/create-checklist-apres-op.dto';
import { UpdateChecklistApresOpDto } from './dto/update-checklist-apres-op.dto';

@Injectable()
export class ChecklistApresOpService {
  constructor(
    @InjectRepository(ChecklistApresOp)
    private repo: Repository<ChecklistApresOp>,
    private accueilClient: AccueilClient,
    private gateway: OperationGateway,
    private patientBlocStatutService: PatientBlocStatutService,
  ) {}

  // La check-list après intervention est enregistrée en un seul POST (formulaire unique côté
  // client, pas de brouillon puis validation séparée) — le transfert en salle de réveil peut
  // donc déjà être coché dès la création, pas seulement lors d'une modification ultérieure.
  async create(
    dto: CreateChecklistApresOpDto,
    centralUser: CentralUser,
  ): Promise<ChecklistApresOp> {
    const saved = await this.repo.save(
      this.repo.create({
        ...dto,
        validateurId: centralUser.userId,
        validateurNom: `${centralUser.prenom} ${centralUser.nom}`.trim(),
        validateurRole: centralUser.role,
      }),
    );
    if (dto.transfertSalleReveil) {
      await this.patientBlocStatutService.changerStatut(
        saved.patientId,
        PatientStatut.EN_SALLE_REVEIL,
      );
    }
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
        `Checklist après opération ${id} non trouvée`,
      );
    const [enriched] = await this.accueilClient.enrichWithIdentity([checklist]);
    return enriched;
  }

  async update(
    id: string,
    dto: UpdateChecklistApresOpDto,
  ): Promise<ChecklistApresOp> {
    const checklist = await this.repo.findOne({ where: { id } });
    if (!checklist)
      throw new NotFoundException(
        `Checklist après opération ${id} non trouvée`,
      );

    const transfertVientDEtreConfirme =
      dto.transfertSalleReveil === true && !checklist.transfertSalleReveil;
    const updated = await this.repo.save(Object.assign(checklist, dto));

    // Le passage en salle de réveil est déclaré ici (checklist de sortie du bloc) — on
    // synchronise automatiquement le statut du patient plutôt que de laisser cette transition
    // manuelle et déconnectée de la machine à états.
    if (transfertVientDEtreConfirme) {
      await this.patientBlocStatutService.changerStatut(
        updated.patientId,
        PatientStatut.EN_SALLE_REVEIL,
      );
    }

    this.gateway.emitToOperation(updated.patientId, 'checklist-apres-op:maj', {
      patientId: updated.patientId,
      checklist: updated,
    });
    return updated;
  }
}
