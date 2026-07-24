import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
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
    @InjectRepository(MomentOperatoire)
    private repo: Repository<MomentOperatoire>,
    private gateway: OperationGateway,
  ) {}

  async create(
    dto: CreateMomentOperatoireDto,
    centralUser: CentralUser,
  ): Promise<MomentOperatoire> {
    // Séparation stricte par rôle : l'anesthésiste n'horodate que la catégorie ANESTHESIE ; le
    // chirurgien ne clique jamais de bouton (délègue toujours à l'IBODE) ; l'IBODE couvre
    // CHIRURGIE et DIVERS. Pas de chevauchement entre catégories anesthésiste/IBODE.
    const role = matchRoleClinique(centralUser.role);
    const categoriesAutorisees: Record<string, string[]> = {
      [RoleClinique.ANESTHESISTE]: ['ANESTHESIE'],
      [RoleClinique.IBODE]: ['CHIRURGIE', 'DIVERS'],
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
    this.gateway.emitToOperation(saved.patientId, 'moment:cree', {
      patientId: saved.patientId,
      moment: saved,
    });
    return saved;
  }

  async findAll(
    patientId: string,
    inclureAnnules = false,
  ): Promise<MomentOperatoire[]> {
    return this.repo.find({
      where: inclureAnnules ? { patientId } : { patientId, annule: false },
      order: { horodatage: 'ASC' },
    });
  }

  async annuler(
    id: string,
    centralUser: CentralUser,
  ): Promise<MomentOperatoire> {
    const moment = await this.repo.findOne({ where: { id } });
    if (!moment)
      throw new NotFoundException(`Moment opératoire ${id} non trouvé`);
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
