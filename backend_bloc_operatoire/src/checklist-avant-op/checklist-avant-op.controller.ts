import { Controller, Get, Post, Body, Patch, Param, Delete, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ChecklistAvantOp } from '../entities/checklist-avant-op.entity';

@ApiTags('Checklist Avant Op')
@Controller('checklists-avant-op')
export class ChecklistAvantOpController {
  constructor(@InjectRepository(ChecklistAvantOp) private repo: Repository<ChecklistAvantOp>) {}

  @Post()
  @ApiOperation({ summary: 'Créer une checklist avant opération' })
  create(@Body() dto: any) { return this.repo.save(this.repo.create(dto)); }

  @Get()
  @ApiOperation({ summary: 'Lister les checklists avant opération' })
  findAll(@Query('patientId') patientId?: string) {
    return this.repo.find({ where: patientId ? { patientId } : {}, relations: ['patient'] });
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.repo.findOne({ where: { id }, relations: ['patient'] }); }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) { return this.repo.update(id, dto); }
}
