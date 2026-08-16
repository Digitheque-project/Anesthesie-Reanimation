import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { PlanningService } from './planning.service';
import { TypeRDV } from '../entities/creneau-bloc.entity';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Planning')
@ApiBearerAuth('JWT-auth')
@Controller('planning')
export class PlanningController {
  constructor(private readonly service: PlanningService) {}

  @Get('jour')
  @ApiOperation({ summary: 'Créneaux (CPA / vérification veille) planifiés pour une journée donnée' })
  @ApiQuery({ name: 'date', required: true, description: 'Date au format AAAA-MM-JJ' })
  @ApiQuery({ name: 'type', required: false, enum: TypeRDV })
  getJour(@Query('date') date: string, @Query('type') type?: TypeRDV) {
    return this.service.getPlanningJour(date, type);
  }

  @Get('semaine')
  @ApiOperation({ summary: 'Créneaux (CPA / vérification veille) planifiés sur une plage de dates' })
  @ApiQuery({ name: 'debut', required: true, description: 'Date de début au format AAAA-MM-JJ' })
  @ApiQuery({ name: 'fin', required: true, description: 'Date de fin au format AAAA-MM-JJ' })
  @ApiQuery({ name: 'type', required: false, enum: TypeRDV })
  getSemaine(
    @Query('debut') debut: string,
    @Query('fin') fin: string,
    @Query('type') type?: TypeRDV,
  ) {
    return this.service.getPlanningSemaine(debut, fin, type);
  }

  @Post('reserver')
  @RequireRoleClinique(
    RoleClinique.MAJOR,
    RoleClinique.RESPONSABLE_CPA,
    RoleClinique.ANESTHESISTE,
  )
  @ApiOperation({
    summary:
      'Réserver un créneau (Major, Responsable CPA, ou Anesthésiste pour poser la date de vérification veille / de report de CPA depuis sa propre consultation)',
  })
  reserver(@Body() dto: any) {
    return this.service.reserverCreneau(dto);
  }

  @Delete(':id')
  @RequireRoleClinique(RoleClinique.MAJOR, RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({
    summary:
      'Annuler un créneau (Major, ou Responsable CPA pour la planification CPA)',
  })
  annuler(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.annulerCreneau(id);
  }

  @Get('urgences')
  @ApiOperation({ summary: 'Créneaux marqués urgents, en attente' })
  urgences() {
    return this.service.getUrgencesEnAttente();
  }

  @Get('cpa-a-venir')
  @ApiOperation({
    summary:
      'Rendez-vous CPA à venir (bannière du Fil de travail — patients déjà planifiés)',
  })
  cpaAVenir() {
    return this.service.getProchainsRdvCpa();
  }

  @Get('retards')
  @ApiOperation({
    summary:
      "CPA, vérification veille et opérations dont la date prévue est dépassée sans que l'étape correspondante soit faite",
  })
  retards() {
    return this.service.getRetards();
  }
}
