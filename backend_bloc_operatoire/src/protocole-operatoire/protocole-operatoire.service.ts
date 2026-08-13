import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProtocoleOperatoire } from '../entities/protocole-operatoire.entity';
import { Drainage } from '../entities/drainage.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { TracabiliteService } from '../tracabilite/tracabilite.service';
import { CentralUser } from '../central-auth/central-user.interface';
import { agitCommeAnesthesiste, matchRoleClinique } from '../central-auth/role-clinique';
import { CreateProtocoleOperatoireDto } from './dto/create-protocole-operatoire.dto';
import { UpdateProtocoleOperatoireDto } from './dto/update-protocole-operatoire.dto';

const INTERVENANTS: [string, string][] = [
  ['chirurgienId', 'chirurgien'],
  ['anesthesisteId', 'anesthesiste'],
  ['infirmiereId', 'infirmiere'],
  ['aideOperatoireId', 'aideOperatoire'],
];

@Injectable()
export class ProtocoleOperatoireService {
  constructor(
    @InjectRepository(ProtocoleOperatoire)
    private repo: Repository<ProtocoleOperatoire>,
    @InjectRepository(Drainage) private drainageRepo: Repository<Drainage>,
    private accueilClient: AccueilClient,
    private medecinIdentiteService: MedecinIdentiteService,
    private gateway: OperationGateway,
    private tracabiliteService: TracabiliteService,
  ) {}
  async create(
    dto: CreateProtocoleOperatoireDto,
    centralUser?: CentralUser,
  ): Promise<ProtocoleOperatoire> {
    const { drainages, ...data } = dto as any;
    // Le formulaire ne propose aucun sélecteur pour désigner l'anesthésiste (voir le
    // commentaire sur l'entité) — cette route est réservée à l'anesthésiste (et au Major qui le
    // remplace totalement) : l'utilisateur connecté EST l'anesthésiste, on l'auto-renseigne sur
    // le champ anesthesisteId plutôt que de dépendre d'une saisie manuelle. Sans identité
    // connectée (jamais en pratique ici), on garde la valeur du DTO.
    const role = centralUser ? matchRoleClinique(centralUser.role) : null;
    if (agitCommeAnesthesiste(role))
      data.anesthesisteId = centralUser!.userId;

    // Un seul enregistrement par patient/jour d'opération (Instructions Post-Opératoires, voir
    // l'entité) : le frontend préremplit son formulaire depuis un GET puis PATCH s'il trouve déjà
    // une ligne — mais si l'utilisateur ouvre sa page avant d'avoir sauvegardé puis enregistre,
    // on fusionne dans la ligne existante plutôt que d'en créer une seconde.
    const existant = data.patientId && data.dateOperation
      ? await this.repo.findOne({
          where: { patientId: data.patientId, dateOperation: data.dateOperation },
        })
      : null;

    let saved: ProtocoleOperatoire;
    if (existant) {
      saved = await this.repo.save(Object.assign(existant, data));
    } else {
      const proto = this.repo.create(data);
      const protoSaved = await this.repo.save(proto);
      saved = Array.isArray(protoSaved) ? protoSaved[0] : protoSaved;
    }

    if (drainages?.length)
      await this.drainageRepo.save(
        drainages.map((d: any) =>
          this.drainageRepo.create({ ...d, protocole: saved }),
        ),
      );
    const complet = await this.findOne(saved.id);
    await this.tracabiliteService.log(
      'ProtocoleOperatoire',
      saved.id,
      'CREATE',
      { patientId: complet.patientId },
      centralUser?.userId,
    );
    this.gateway.emitToOperation(
      complet.patientId,
      'protocole-operatoire:maj',
      { patientId: complet.patientId, protocole: complet },
    );
    return complet;
  }
  async findAll(page = 1, limite = 10, patientId?: string) {
    const [data, total] = await this.repo.findAndCount({
      where: patientId ? { patientId } : {},
      relations: ['drainages'],
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
    const enriched = await this.medecinIdentiteService.enrichirPlusieurs(
      enrichedPatient,
      INTERVENANTS,
    );
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }
  async findOne(id: string): Promise<any> {
    const p = await this.repo.findOne({
      where: { id },
      relations: ['drainages'],
    });
    if (!p) throw new NotFoundException(`Protocole ${id} non trouvé`);
    const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([p]);
    const [enriched] = await this.medecinIdentiteService.enrichirPlusieurs(
      [enrichedPatient],
      INTERVENANTS,
    );
    return enriched;
  }
  async update(
    id: string,
    dto: UpdateProtocoleOperatoireDto,
    centralUser?: CentralUser,
  ): Promise<ProtocoleOperatoire> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Protocole ${id} non trouvé`);
    const { drainages, ...data } = dto as any;
    const role = centralUser ? matchRoleClinique(centralUser.role) : null;
    if (agitCommeAnesthesiste(role))
      data.anesthesisteId = centralUser!.userId;
    const updated = await this.repo.save(Object.assign(p, data));
    // Remplacement complet du set de drainages à chaque sauvegarde — pas d'identité stable côté
    // formulaire (juste les lignes cochées à l'instant T), donc pas de diff possible.
    if (drainages !== undefined) {
      await this.drainageRepo.delete({ protocole: { id } as any });
      if (drainages.length)
        await this.drainageRepo.save(
          drainages.map((d: any) =>
            this.drainageRepo.create({ ...d, protocole: updated }),
          ),
        );
    }
    const complet = await this.findOne(updated.id);
    await this.tracabiliteService.log(
      'ProtocoleOperatoire',
      id,
      'UPDATE',
      { patientId: complet.patientId },
      centralUser?.userId,
    );
    this.gateway.emitToOperation(
      complet.patientId,
      'protocole-operatoire:maj',
      { patientId: complet.patientId, protocole: complet },
    );
    return complet;
  }
  async remove(id: string): Promise<{ message: string }> {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException(`Protocole ${id} non trouvé`);
    await this.repo.delete(id);
    return { message: 'Protocole supprimé' };
  }
}
