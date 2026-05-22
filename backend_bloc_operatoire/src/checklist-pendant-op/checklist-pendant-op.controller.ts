import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistPendantOp } from '../entities/checklist-pendant-op.entity';

@ApiTags('Checklist Pendant Op')
@Controller('checklists-pendant-op')
export class ChecklistPendantOpController {
  constructor(@InjectRepository(ChecklistPendantOp) private repo: Repository<ChecklistPendantOp>) {}

  @Post()
  @ApiOperation({ summary: 'Créer une checklist pendant opération' })
  create(@Body() dto: any) { return this.repo.save(this.repo.create(dto)); }

  @Get()
  @ApiOperation({ summary: 'Lister les checklists pendant opération' })
  findAll(@Query('patientId') patientId?: string) {
    return this.repo.find({ where: patientId ? { patientId } : {}, relations: ['patient'] });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.repo.findOne({ where: { id }, relations: ['patient'] }); }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) { return this.repo.update(id, dto); }
}
