import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MomentOperatoire } from '../entities/moment-operatoire.entity';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { CentralUser } from '../central-auth/central-user.interface';
import { matchRoleClinique, RoleClinique } from '../central-auth/role-clinique';
import { CreateMomentOperatoireDto } from './dto/create-moment-operatoire.dto';

@Injectable()
export class MomentsOperatoireService {
  constructor(
    @InjectRepository(MomentOperatoire) private repo: Repository<MomentOperatoire>,
    private gateway: OperationGateway,
  ) {}

  async create(dto: CreateMomentOperatoireDto, centralUser: CentralUser): Promise<MomentOperatoire> {
    // Chaque rôle horodate sa propre catégorie de moments : l'anesthésiste peut tout
    // horodater, chirurgien et IBODE sont limités à la catégorie CHIRURGIE (l'IBODE assiste le
    // chirurgien et peut horodater à sa place quand ses mains sont occupées).
    const role = matchRoleClinique(centralUser.role);
    const categoriesAutorisees: Record<string, string[]> = {
      [RoleClinique.ANESTHESISTE]: ['ANESTHESIE', 'CHIRURGIE', 'DIVERS'],
      [RoleClinique.CHIRURGIEN]: ['CHIRURGIE'],
      [RoleClinique.IBODE]: ['CHIRURGIE'],
    };
    const autorisees = role ? categoriesAutorisees[role] : undefined;
    if (!autorisees || !autorisees.includes(dto.categorie)) {
      throw new ForbiddenException(
        `Votre rôle (${centralUser.role}) ne peut pas horodater la catégorie ${dto.categorie}.`,
      );
    }

    const moment = this.repo.create({
      ...dto,
      horodatage: new Date(dto.horodatage),
      auteurId: centralUser.userId,
      auteurNom: `${centralUser.prenom} ${centralUser.nom}`.trim(),
      auteurRole: centralUser.role,
    });
    const saved = await this.repo.save(moment);
    this.gateway.emitToOperation(saved.patientId, 'moment:cree', { patientId: saved.patientId, moment: saved });
    return saved;
  }

  async findAll(patientId: string, inclureAnnules = false): Promise<MomentOperatoire[]> {
    return this.repo.find({
      where: inclureAnnules ? { patientId } : { patientId, annule: false },
      order: { horodatage: 'ASC' },
    });
  }

  async annuler(id: string, centralUser: CentralUser): Promise<MomentOperatoire> {
    const moment = await this.repo.findOne({ where: { id } });
    if (!moment) throw new NotFoundException(`Moment opératoire ${id} non trouvé`);
    moment.annule = true;
    moment.annuleLe = new Date();
    moment.annuleParNom = `${centralUser.prenom} ${centralUser.nom}`.trim();
    const saved = await this.repo.save(moment);
    this.gateway.emitToOperation(saved.patientId, 'moment:annule', {
      patientId: saved.patientId,
      momentId: saved.id,
      annuleParNom: saved.annuleParNom,
    });
    return saved;
  }
}
