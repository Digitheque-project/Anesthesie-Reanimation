import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivitePerOp } from '../entities/activite-per-op.entity';
import { ConstantePerOp } from '../entities/constante-per-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { MedecinIdentiteService } from '../medecin/medecin-identite.service';
import { OperationGateway } from '../operation-gateway/operation.gateway';
import { CreateActivitePerOpDto } from './dto/create-activite-per-op.dto';
import { UpdateActivitePerOpDto } from './dto/update-activite-per-op.dto';
import { AjouterConstanteDto } from './dto/ajouter-constante.dto';

@Injectable()
export class ActivitePerOpService {
  constructor(
    @InjectRepository(ActivitePerOp) private repo: Repository<ActivitePerOp>,
    @InjectRepository(ConstantePerOp)
    private constanteRepo: Repository<ConstantePerOp>,
    private accueilClient: AccueilClient,
    private medecinIdentiteService: MedecinIdentiteService,
    private gateway: OperationGateway,
  ) {}

  async create(dto: CreateActivitePerOpDto): Promise<ActivitePerOp> {
    const { constantes, ...data } = dto;

    // Créer l'activité per-op
    const activite = this.repo.create(data);
    const activiteSaved = await this.repo.save(activite);
    const saved = Array.isArray(activiteSaved)
      ? activiteSaved[0]
      : activiteSaved;

    // ✅ Ajouter toutes les constantes (surveillances multiples)
    if (constantes && constantes.length > 0) {
      const constantesEntities = constantes.map((c) =>
        this.constanteRepo.create({
          ...c,
          activitePerOp: saved,
        }),
      );
      await this.constanteRepo.save(constantesEntities);
      console.log(
        `✅ ${constantesEntities.length} mesures de constantes enregistrées`,
      );
    }

    return this.findOne(saved.id);
  }

  async findAll(page = 1, limite = 10, patientId?: string) {
    const [data, total] = await this.repo.findAndCount({
      where: patientId ? { patientId } : {},
      relations: ['constantes'],
      skip: (page - 1) * limite,
      take: limite,
      order: { createdAt: 'DESC' },
    });
    const enrichedPatient = await this.accueilClient.enrichWithIdentity(data);
    const enriched = await this.medecinIdentiteService.enrichirPlusieurs(
      enrichedPatient,
      [
        ['chirurgienId', 'chirurgien'],
        ['anesthesisteId', 'anesthesiste'],
      ],
    );
    return { data: enriched, total, page, pages: Math.ceil(total / limite) };
  }

  async findOne(id: string): Promise<any> {
    const a = await this.repo.findOne({
      where: { id },
      relations: ['constantes'],
    });
    if (!a) throw new NotFoundException(`Activité ${id} non trouvée`);
    const [enrichedPatient] = await this.accueilClient.enrichWithIdentity([a]);
    const [enriched] = await this.medecinIdentiteService.enrichirPlusieurs(
      [enrichedPatient],
      [
        ['chirurgienId', 'chirurgien'],
        ['anesthesisteId', 'anesthesiste'],
      ],
    );
    return enriched;
  }

  async update(
    id: string,
    dto: UpdateActivitePerOpDto,
  ): Promise<ActivitePerOp> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Activité ${id} non trouvée`);
    return this.repo.save(Object.assign(a, dto));
  }

  async remove(id: string): Promise<{ message: string }> {
    const a = await this.repo.findOne({ where: { id } });
    if (!a) throw new NotFoundException(`Activité ${id} non trouvée`);
    await this.repo.delete(id);
    return { message: 'Activité supprimée' };
  }

  // Ajout ponctuel d'une mesure de constantes en temps réel pendant l'opération (distinct de la
  // saisie groupée de create()) — diffusée immédiatement à tous les postes connectés sur ce
  // patient.
  async ajouterConstante(
    activiteId: string,
    dto: AjouterConstanteDto,
  ): Promise<ConstantePerOp> {
    const activite = await this.repo.findOne({ where: { id: activiteId } });
    if (!activite)
      throw new NotFoundException(`Activité ${activiteId} non trouvée`);

    const horodatage = new Date(dto.horodatage);
    const constante = this.constanteRepo.create({
      fc: dto.fc,
      ta: dto.ta,
      spo2: dto.spo2,
      temperature: dto.temperature,
      capnie: dto.capnie,
      score: dto.score,
      horodatage,
      heure: horodatage.toTimeString().split(' ')[0].substring(0, 5),
      activitePerOp: activite,
    });
    const saved = await this.constanteRepo.save(constante);
    this.gateway.emitToOperation(activite.patientId, 'constante:ajoutee', {
      patientId: activite.patientId,
      constante: saved,
    });
    return saved;
  }
}
