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

@ApiTags('Checklist Avant Op')
@Controller('checklists-avant-op')
export class ChecklistAvantOpController {
  constructor(
    @InjectRepository(ChecklistAvantOp)
    private repo: Repository<ChecklistAvantOp>,
    private accueilClient: AccueilClient,
  ) {}

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({
    summary: 'Créer une checklist avant opération (Anesthésiste)',
  })
  create(@Body() dto: any, @Request() req: any) {
    const centralUser = req.centralUser;
    return this.repo.save(
      this.repo.create({
        ...dto,
        validateurId: centralUser?.userId,
        validateurNom: centralUser
          ? `${centralUser.prenom} ${centralUser.nom}`.trim()
          : undefined,
        validateurRole: centralUser?.role,
      }),
    );
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
  update(@Param('id') id: string, @Body() dto: any) {
    return this.repo.update(id, dto);
  }
}
