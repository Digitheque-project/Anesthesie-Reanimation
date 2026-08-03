import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SortieReveil } from '../entities/sortie-reveil.entity';
import { ScoreSCCRE } from '../entities/score-sccre.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { PatientBlocStatutService } from '../patient-bloc/patient-bloc-statut.service';
import { PatientStatut } from '../entities/patient-bloc.entity';
import { CentralUser } from '../central-auth/central-user.interface';
import { TracabiliteService } from '../tracabilite/tracabilite.service';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';

@Injectable()
export class SortieReveilService {
  constructor(
    @InjectRepository(SortieReveil) private repo: Repository<SortieReveil>,
    @InjectRepository(ScoreSCCRE) private scoreRepo: Repository<ScoreSCCRE>,
    private accueilClient: AccueilClient,
    private medecinIdentiteService: MedecinIdentiteService,
    private patientBlocStatutService: PatientBlocStatutService,
    private tracabiliteService: TracabiliteService,
  ) {}

  // Le médecin autorisant la sortie est toujours l'anesthésiste connecté (route réservée au
  // rôle ANESTHESISTE) — son identité SSO (userId central) sert directement de référence, plus
  // besoin d'une fiche Médecin locale préalable. Même logique que CPAService.create.
  async create(
    dto: CreateSortieReveilDto,
    centralUser: CentralUser,
  ): Promise<SortieReveil> {
    // @IsBoolean() sur ChecklistSortieReveilDto accepte aussi bien true que false : il valide le
    // type, pas que chaque point ait réellement été confirmé. La checklist de sortie doit être
    // entièrement cochée (comme déjà exigé côté frontend, salle-de-reveil/*) avant d'autoriser
    // la sortie du patient.
    const itemsNonConfirmes = Object.entries(dto.checklistSortie ?? {}).filter(
      ([, valeur]) => valeur !== true,
    );
    if (itemsNonConfirmes.length) {
      throw new BadRequestException(
        `Checklist de sortie incomplète — items non confirmés : ${itemsNonConfirmes.map(([cle]) => cle).join(', ')}`,
      );
    }

    // Le seuil "score >= 9" n'était vérifié que côté frontend (bouton désactivé) — un appel API
    // direct pouvait autoriser la sortie d'un patient au réveil non stabilisé. On revérifie ici
    // le score réellement enregistré, et qu'il appartient bien à CE patient (pas un scoreSCCREId
    // d'un autre patient envoyé par erreur ou de façon malveillante).
    const score = await this.scoreRepo.findOne({
      where: { id: dto.scoreSCCREId },
    });
    if (!score) {
      throw new BadRequestException('Score de réveil (SCCRE) introuvable.');
    }
    if (score.patientId !== dto.patientId) {
      throw new BadRequestException(
        "Ce score de réveil n'appartient pas à ce patient.",
      );
    }
    if (score.scoreTotal < 9) {
      throw new BadRequestException(
        `Score de réveil insuffisant (${score.scoreTotal}/10) — la sortie nécessite un score ≥ 9.`,
      );
    }

    const saved = await this.repo.save(
      this.repo.create({ ...(dto as any), medecinId: centralUser.userId }),
    );
    const sortie = Array.isArray(saved) ? saved[0] : saved;
    await this.tracabiliteService.log(
      'SortieReveil',
      sortie.id,
      'CREATE',
      { patientId: sortie.patientId },
      centralUser.userId,
    );
    // Sans ce passage à SORTI, le patient reste indéfiniment à EN_SALLE_REVEIL : jamais visible
    // aux Archives (filtrées sur statut=SORTI) ni dans le décompte de sorties des Rapports,
    // alors même que sa sortie vient d'être validée.
    if (sortie.patientId) {
      await this.patientBlocStatutService.changerStatut(
        sortie.patientId,
        PatientStatut.SORTI,
        centralUser.userId,
      );
    }
    return sortie;
  }
  async findAll(page = 1, limite = 10) {
    const [data, total] = await this.repo.findAndCount({
      relations: ['scoreSCCRE'],
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
    const enriched = await this.medecinIdentiteService.enrichir(
      enrichedPatient,
      'medecinId',
      'medecin',
    );
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<any> {
    const s = await this.repo.findOne({
      where: { id },
      relations: ['scoreSCCRE'],
    });
    if (!s) throw new NotFoundException(`Sortie ${id} non trouvée`);
    const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([s]);
    const [enriched] = await this.medecinIdentiteService.enrichir(
      [enrichedPatient],
      'medecinId',
      'medecin',
    );
    return enriched;
  }
  async update(id: string, dto: UpdateSortieReveilDto): Promise<SortieReveil> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException(`Sortie ${id} non trouvée`);
    return this.repo.save(Object.assign(s, dto));
  }
  async remove(id: string): Promise<{ message: string }> {
    const s = await this.repo.findOne({ where: { id } });
    if (!s) throw new NotFoundException(`Sortie ${id} non trouvée`);
    await this.repo.delete(id);
    return { message: 'Sortie supprimée' };
  }
}
