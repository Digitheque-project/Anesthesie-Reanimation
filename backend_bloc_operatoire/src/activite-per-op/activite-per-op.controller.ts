import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ActivitePerOpService } from './activite-per-op.service';
import { CreateActivitePerOpDto } from './dto/create-activite-per-op.dto';
import { UpdateActivitePerOpDto } from './dto/update-activite-per-op.dto';
import { AjouterConstanteDto } from './dto/ajouter-constante.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Activités Per-Op')
@ApiBearerAuth('JWT-auth')
@Controller('activites-per-op')
export class ActivitePerOpController {
  constructor(private readonly service: ActivitePerOpService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une activité per-op' })
  create(@Body() dto: CreateActivitePerOpDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Lister les activités (filtrable par patientId)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  findAll(@Query('page') p?: number, @Query('limite') l?: number, @Query('patientId') patientId?: string) {
    return this.service.findAll(p, l, patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une activité par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une activité' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateActivitePerOpDto) { return this.service.update(id, dto); }

  @Post(':id/constantes')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.IBODE)
  @ApiOperation({ summary: 'Ajouter une mesure de constantes en temps réel (Anesthésiste, IBODE)' })
  ajouterConstante(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AjouterConstanteDto) {
    return this.service.ajouterConstante(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une activité' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
