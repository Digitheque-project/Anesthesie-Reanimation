import { Controller, Get, Post, Body, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PlanningService } from './planning.service';
import { TypeRDV } from '../entities/creneau-bloc.entity';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Planning')
@Controller('planning')
export class PlanningController {
  constructor(private readonly service: PlanningService) {}

  @Get('jour')
  @ApiQuery({ name: 'date', required: true })
  @ApiQuery({ name: 'type', required: false, enum: TypeRDV })
  getJour(@Query('date') date: string, @Query('type') type?: TypeRDV) {
    return this.service.getPlanningJour(date, type);
  }

  @Get('semaine')
  getSemaine(@Query('debut') debut: string, @Query('fin') fin: string, @Query('type') type?: TypeRDV) {
    return this.service.getPlanningSemaine(debut, fin, type);
  }

  @Post('reserver')
  @RequireRoleClinique(RoleClinique.MAJOR, RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: 'Réserver un créneau (Major, ou Responsable CPA pour la planification CPA)' })
  reserver(@Body() dto: any) { return this.service.reserverCreneau(dto); }

  @Delete(':id')
  @RequireRoleClinique(RoleClinique.MAJOR, RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: 'Annuler un créneau (Major, ou Responsable CPA pour la planification CPA)' })
  annuler(@Param('id', ParseUUIDPipe) id: string) { return this.service.annulerCreneau(id); }

  @Get('urgences')
  urgences() { return this.service.getUrgencesEnAttente(); }

  // Transférer CPA → Vérification veille
  @Post('transferer-cpa-vers-verification-veille')
  @RequireRoleClinique(RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: 'Transférer un patient de CPA vers Vérification veille (Responsable CPA)' })
  transfererCpaVersVerificationVeille(@Body() dto: { patientId: string; chirurgienId: string; dateVerificationVeille: string; heureDebut: string; salle: string }) {
    return this.service.transfererCpaVersVerificationVeille(dto);
  }

  // Transférer Vérification veille → Patient du jour
  @Post('transferer-verification-veille-vers-patient-jour')
  @RequireRoleClinique(RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: 'Transférer un patient de Vérification veille vers Patient du jour (Responsable CPA)' })
  transfererVerificationVeilleVersPatientJour(@Body() dto: { patientId: string; chirurgienId: string; date: string; heureDebut: string; salle: string }) {
    return this.service.transfererVerificationVeilleVersPatientJour(dto);
  }
}
