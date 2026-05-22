import { Controller, Get, Post, Body, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PlanningService } from './planning.service';
import { TypeRDV } from '../entities/creneau-bloc.entity';

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
  reserver(@Body() dto: any) { return this.service.reserverCreneau(dto); }

  @Delete(':id')
  annuler(@Param('id', ParseUUIDPipe) id: string) { return this.service.annulerCreneau(id); }

  @Get('urgences')
  urgences() { return this.service.getUrgencesEnAttente(); }

  // NOUVEAU : Transférer CPA → VPA
  @Post('transferer-cpa-vers-vpa')
  @ApiOperation({ summary: 'Transférer un patient de CPA vers VPA' })
  transfererCpaVersVpa(@Body() dto: { patientId: string; chirurgienId: string; dateVPA: string; heureDebut: string; salle: string }) {
    return this.service.transfererCpaVersVpa(dto);
  }

  // NOUVEAU : Transférer VPA → Patient du jour
  @Post('transferer-vpa-vers-patient-jour')
  @ApiOperation({ summary: 'Transférer un patient de VPA vers Patient du jour' })
  transfererVpaVersPatientJour(@Body() dto: { patientId: string; chirurgienId: string; date: string; heureDebut: string; salle: string }) {
    return this.service.transfererVpaVersPatientJour(dto);
  }
}
