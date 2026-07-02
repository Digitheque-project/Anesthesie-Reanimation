import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistApresOp } from '../entities/checklist-apres-op.entity';
import { AccueilClient } from '../external/accueil.client';

@ApiTags('Checklist Après Op')
@Controller('checklists-apres-op')
export class ChecklistApresOpController {
  constructor(
    @InjectRepository(ChecklistApresOp) private repo: Repository<ChecklistApresOp>,
    private accueilClient: AccueilClient,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Créer une checklist après opération' })
  create(@Body() dto: any) { return this.repo.save(this.repo.create(dto)); }

  @Get()
  @ApiOperation({ summary: 'Lister les checklists après opération' })
  async findAll(@Query('patientId') patientId?: string) {
    const data = await this.repo.find({ where: patientId ? { patientId } : {} });
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
  update(@Param('id') id: string, @Body() dto: any) { return this.repo.update(id, dto); }
}
