import { Controller, Get, Post, Body, Patch, Param, Query, HttpCode, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DemandeCpaExterneService } from './demande-cpa-externe.service';
import { ReceiveDemandeCpaDto } from './dto/receive-demande-cpa.dto';
import { UpdateDemandeCpaDto } from './dto/update-demande-cpa.dto';
import { PlanifierDemandeCpaDto } from './dto/planifier-demande-cpa.dto';
import { StatutDemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { Public } from '../central-auth/public.decorator';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

// Intégration entrante pour les services externes (multi-CHU) souhaitant faire réaliser une
// CPA/VPA par le Bloc Opératoire pour un de leurs patients : réception de la demande (webhook
// public), planification du rendez-vous, puis retour automatique du résultat une fois la CPA
// réalisée (voir CPAService.create et VerificationVeilleService.create, qui appellent
// DemandeCpaExterneService.notifierResultat).
@ApiTags('Demandes CPA externes')
@Controller('demandes-cpa-externes')
export class DemandeCpaExterneController {
  constructor(private readonly service: DemandeCpaExterneService) {}

  // Webhook entrant appelé par un service externe (ex: Endoscopie, Prescription...) — pas un
  // utilisateur du SSO central, donc @Public().
  @Public()
  @Post('receive')
  @HttpCode(200)
  @ApiOperation({
    summary: "Recevoir une demande de CPA/VPA d'un service externe",
    description:
      "Point d'entrée pour tout service externe du CHU souhaitant qu'un de ses patients passe une " +
      "Consultation Pré-Anesthésique avant un acte sous anesthésie. Fournir `sourceCallbackUrl` pour " +
      "recevoir automatiquement le résultat (décision APTE/INAPTE/REPORT) dès que la CPA est réalisée.",
  })
  @ApiResponse({ status: 200, description: 'Demande enregistrée avec succès.' })
  async receive(@Body() dto: ReceiveDemandeCpaDto) {
    const demande = await this.service.receive(dto);
    return { received: true, id: demande.id, statut: demande.statut, timestamp: new Date().toISOString() };
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister les demandes de CPA externes' })
  @ApiQuery({ name: 'statut', required: false, enum: StatutDemandeCpaExterne })
  findAll(@Query('statut') statut?: StatutDemandeCpaExterne) {
    return this.service.findAll(statut);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir une demande de CPA externe' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequireRoleClinique(RoleClinique.RESPONSABLE_CPA, RoleClinique.MAJOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Modifier une demande de CPA externe (Responsable CPA, Major)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDemandeCpaDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/planifier')
  @RequireRoleClinique(RoleClinique.RESPONSABLE_CPA, RoleClinique.MAJOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Planifier le rendez-vous CPA/VPA pour cette demande externe (Responsable CPA, Major)' })
  planifier(@Param('id', ParseUUIDPipe) id: string, @Body() dto: PlanifierDemandeCpaDto) {
    return this.service.planifier(id, dto);
  }
}
