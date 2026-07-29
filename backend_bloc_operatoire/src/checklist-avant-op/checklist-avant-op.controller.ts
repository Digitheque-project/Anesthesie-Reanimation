import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';
import { TracabiliteService } from '../tracabilite/tracabilite.service';

// Items obligatoires : les 4 items Oui/Non de la phase 1, les 2 confirmations de matériel
// (doivent être cochées) et les 3 points de vérification croisée (allergie/intubation/
// saignement, à répondre activement même si la réponse est "non"). Dupliqué avec la
// vérification déjà faite côté frontend (checklist-oms/page.tsx), pour ne pas dépendre
// uniquement du client sur un point de sécurité patient.
const ITEMS_TRI_STATE = [
  'identiteConfirmee',
  'interventionSiteConfirmes',
  'documentationDisponible',
  'installationConnue',
  'allergiePatient',
  'risqueIntubation',
  'risqueSaignement',
];
const ITEMS_COCHES = ['materielChirurgicalVerifie', 'materielAnesthesiqueVerifie'];

function verifierChecklistComplete(dto: any) {
  const manquants = ITEMS_TRI_STATE.filter(
    (cle) => dto[cle] === null || dto[cle] === undefined,
  );
  const nonCoches = ITEMS_COCHES.filter((cle) => dto[cle] !== true);
  if (manquants.length || nonCoches.length) {
    throw new BadRequestException(
      `Checklist incomplète — items manquants : ${[...manquants, ...nonCoches].join(', ')}`,
    );
  }
}

@ApiTags('Checklist Avant Op')
@Controller('checklists-avant-op')
export class ChecklistAvantOpController {
  constructor(
    @InjectRepository(ChecklistAvantOp)
    private repo: Repository<ChecklistAvantOp>,
    private accueilClient: AccueilClient,
    private tracabiliteService: TracabiliteService,
  ) {}

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({
    summary: 'Créer une checklist avant opération (Anesthésiste)',
  })
  async create(@Body() dto: any, @Request() req: any) {
    verifierChecklistComplete(dto);
    const centralUser = req.centralUser;
    const savedResult = await this.repo.save(
      this.repo.create({
        ...dto,
        validateurId: centralUser?.userId,
        validateurNom: centralUser
          ? `${centralUser.prenom} ${centralUser.nom}`.trim()
          : undefined,
        validateurRole: centralUser?.role,
      }),
    );
    const saved: ChecklistAvantOp = Array.isArray(savedResult)
      ? savedResult[0]
      : savedResult;
    await this.tracabiliteService.log(
      'ChecklistAvantOp',
      saved.id,
      'CREATE',
      { patientId: saved.patientId },
      centralUser?.userId,
    );
    return saved;
  }

  @Get()
  @ApiOperation({ summary: 'Lister les checklists avant opération' })
  async findAll(@Query('patientId') patientId?: string) {
    const data = await this.repo.find({
      where: patientId ? { patientId } : {},
    });
    return this.accueilClient.enrichWithIdentity(data);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const checklist = await this.repo.findOne({ where: { id } });
    if (!checklist) return null;
    const [enriched] = await this.accueilClient.enrichWithIdentity([checklist]);
    return enriched;
  }

  @Patch(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({
    summary: 'Modifier une checklist avant opération (Anesthésiste)',
  })
  async update(@Param('id') id: string, @Body() dto: any, @Request() req: any) {
    const result = await this.repo.update(id, dto);
    await this.tracabiliteService.log(
      'ChecklistAvantOp',
      id,
      'UPDATE',
      dto,
      req.centralUser?.userId,
    );
    return result;
  }
}
