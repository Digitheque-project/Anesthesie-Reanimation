import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChecklistPendantOpService } from './checklist-pendant-op.service';
import { CreateChecklistPendantOpDto } from './dto/create-checklist-pendant-op.dto';
import { UpdateChecklistPendantOpDto } from './dto/update-checklist-pendant-op.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Checklist Pendant Op')
@Controller('checklists-pendant-op')
export class ChecklistPendantOpController {
  constructor(private readonly service: ChecklistPendantOpService) {}

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Créer une checklist pendant opération (Anesthésiste)' })
  create(@Body() dto: CreateChecklistPendantOpDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Lister les checklists pendant opération' })
  findAll(@Query('patientId') patientId?: string) { return this.service.findAll(patientId); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une checklist pendant opération' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Modifier une checklist pendant opération (Anesthésiste)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateChecklistPendantOpDto) { return this.service.update(id, dto); }
}
