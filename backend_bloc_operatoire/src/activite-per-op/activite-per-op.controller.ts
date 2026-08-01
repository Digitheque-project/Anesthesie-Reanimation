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
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
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

  // MAJOR inclus : les écrans arrivee-bloc et activite-pendant-operation créent cet
  // enregistrement automatiquement au chargement (dès qu'un rôle autorisé à *consulter* la page
  // l'ouvre), pas seulement au moment d'un acte clinique — voir le commentaire "Le Major a accès
  // à l'interface pour consulter, mais n'enregistre pas les actes" dans arrivee-bloc/page.tsx.
  @Post()
  @RequireRoleClinique(
    RoleClinique.ANESTHESISTE,
    RoleClinique.IBODE,
    RoleClinique.MAJOR,
  )
  @ApiOperation({ summary: 'Créer une activité per-op (Anesthésiste, IBODE, Major)' })
  create(@Body() dto: CreateActivitePerOpDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les activités (filtrable par patientId)' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  findAll(
    @Query('page') p?: number,
    @Query('limite') l?: number,
    @Query('patientId') patientId?: string,
  ) {
    return this.service.findAll(p, l, patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une activité par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.IBODE)
  @ApiOperation({ summary: 'Modifier une activité (Anesthésiste, IBODE)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateActivitePerOpDto,
    @Request() req: any,
  ) {
    return this.service.update(id, dto, req.centralUser);
  }

  @Post(':id/constantes')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.IBODE)
  @ApiOperation({
    summary:
      'Ajouter une mesure de constantes en temps réel (Anesthésiste, IBODE)',
  })
  ajouterConstante(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AjouterConstanteDto,
  ) {
    return this.service.ajouterConstante(id, dto);
  }

  @Delete(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Supprimer une activité (Anesthésiste)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
