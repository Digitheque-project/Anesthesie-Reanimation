import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ChecklistApresOpService } from './checklist-apres-op.service';
import { CreateChecklistApresOpDto } from './dto/create-checklist-apres-op.dto';
import { UpdateChecklistApresOpDto } from './dto/update-checklist-apres-op.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Checklist Après Op')
@Controller('checklists-apres-op')
export class ChecklistApresOpController {
  constructor(private readonly service: ChecklistApresOpService) {}

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Créer une checklist après opération (Anesthésiste)' })
  create(@Body() dto: CreateChecklistApresOpDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Lister les checklists après opération' })
  findAll(@Query('patientId') patientId?: string) { return this.service.findAll(patientId); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une checklist après opération' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Modifier une checklist après opération (Anesthésiste)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateChecklistApresOpDto) { return this.service.update(id, dto); }
}
