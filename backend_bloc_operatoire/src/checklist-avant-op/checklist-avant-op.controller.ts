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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';
import { AccueilClient } from '../external/accueil.client';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';
import { TracabiliteService } from '../tracabilite/tracabilite.service';

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
