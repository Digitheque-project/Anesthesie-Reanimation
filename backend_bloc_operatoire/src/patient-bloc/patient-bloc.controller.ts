import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';
import { PatientBlocService } from './patient-bloc.service';
import { PatientBlocStatutService } from './patient-bloc-statut.service';
import { AdmitExistingPatientDto } from './dto/admit-existing-patient.dto';
import { RegisterAndAdmitPatientDto } from './dto/register-and-admit-patient.dto';
import { UpdatePatientBlocDto } from './dto/update-patient-bloc.dto';
import { UpdateDateInterventionDto } from './dto/update-date-intervention.dto';

@ApiTags('Patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
export class PatientBlocController {
  constructor(
    private readonly patientBlocService: PatientBlocService,
    private readonly patientBlocStatutService: PatientBlocStatutService,
  ) {}

  @Get('search')
  @ApiOperation({ summary: 'Rechercher un patient dans le service Accueil' })
  @ApiQuery({ name: 'q', required: false })
  search(@Query('q') q?: string) {
    return this.patientBlocService.search(q);
  }

  @Get('external/:externalId')
  @ApiOperation({ summary: 'Obtenir un patient depuis le service Accueil (avant admission)' })
  getExternal(@Param('externalId') externalId: string) {
    return this.patientBlocService.getExternal(externalId);
  }

  @Post('admit')
  @ApiOperation({ summary: 'Admettre au bloc un patient déjà enregistré dans Accueil' })
  admitExisting(@Body() dto: AdmitExistingPatientDto) {
    return this.patientBlocService.admitExisting(dto);
  }

  @Post('register-and-admit')
  @ApiOperation({ summary: "Enregistrer un nouveau patient dans Accueil puis l'admettre au bloc" })
  registerAndAdmit(@Body() dto: RegisterAndAdmitPatientDto, @Request() req: any) {
    const createdBy = req.centralUser?.userId ?? req.centralUser?.email ?? 'unknown';
    return this.patientBlocService.registerAndAdmit(dto, createdBy);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les fiches de suivi bloc (enrichies avec l\'identité Accueil)' })
  @ApiQuery({ name: 'statut', required: false })
  @ApiQuery({ name: 'niveauUrgence', required: false })
  @ApiQuery({ name: 'recherche', required: false, description: 'Recherche locale par idDossier uniquement — utiliser /patients/search pour rechercher par nom' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  findAll(
    @Query('statut') statut?: string,
    @Query('niveauUrgence') niveauUrgence?: string,
    @Query('recherche') recherche?: string,
    @Query('page') page?: number,
    @Query('limite') limite?: number,
  ) {
    return this.patientBlocService.findAll({ statut, niveauUrgence, recherche, page, limite });
  }

  @Get(':patientId')
  @ApiOperation({ summary: 'Obtenir une fiche de suivi bloc par id patient' })
  findOne(@Param('patientId') patientId: string) {
    return this.patientBlocService.findOne(patientId);
  }

  @Get(':patientId/dossier-medical')
  @ApiOperation({ summary: "Contenu du dossier médical partagé pertinent pour le bloc (antécédents, alertes urgentes, dernier examen physique)" })
  getDossierMedical(@Param('patientId') patientId: string, @Request() req: any) {
    const token = (req.headers?.authorization || '').replace(/^Bearer\s+/i, '');
    return this.patientBlocService.getDossierMedical(patientId, token);
  }

  @Patch(':patientId')
  @ApiOperation({ summary: 'Modifier une fiche de suivi bloc' })
  update(@Param('patientId') patientId: string, @Body() dto: UpdatePatientBlocDto) {
    return this.patientBlocService.update(patientId, dto);
  }

  @Patch(':patientId/apte-cpa')
  @RequireRoleClinique(RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: 'Fil de prescription : marquer le patient apte au circuit CPA (Responsable CPA)' })
  marquerApteCpa(@Param('patientId') patientId: string) {
    return this.patientBlocStatutService.marquerApteCpa(patientId);
  }

  @Patch(':patientId/inapte-cpa')
  @RequireRoleClinique(RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: 'Fil de prescription : marquer le patient inapte au circuit CPA (motif obligatoire, Responsable CPA)' })
  marquerInapteCpa(@Param('patientId') patientId: string, @Body('motifRefus') motifRefus: string) {
    return this.patientBlocStatutService.marquerInapteCpa(patientId, motifRefus);
  }

  @Patch(':patientId/date-intervention')
  @RequireRoleClinique(RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: "CPA : modifier la date et l'heure prévues de l'opération (Responsable CPA)" })
  modifierDateIntervention(@Param('patientId') patientId: string, @Body() dto: UpdateDateInterventionDto) {
    return this.patientBlocStatutService.modifierDateIntervention(patientId, dto.dateIntervention);
  }

  @Delete(':patientId')
  @ApiOperation({ summary: 'Supprimer une fiche de suivi bloc' })
  remove(@Param('patientId') patientId: string) {
    return this.patientBlocService.remove(patientId);
  }
}
