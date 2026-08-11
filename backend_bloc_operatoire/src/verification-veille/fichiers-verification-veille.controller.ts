import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';
import {
  FichiersVerificationVeilleService,
} from './fichiers-verification-veille.service';
import type { FichierImporte } from './fichiers-verification-veille.service';

// Limite par fichier : 20 Mo (mémoire) — documents hospitaliers courants (PDF, imagerie,
// ordonnances, comptes-rendus...) largement couverts.
const TAILLE_MAX_FICHIER = 20 * 1024 * 1024;

// Accès restreints à l'anesthésiste et au major, comme le reste de l'écran « Vérification la
// veille » (RoleGate frontend identique). Le garde SSO central reste global (CentralAuthGuard).
@ApiTags('Vérification veille — pièces jointes')
@Controller('verification-veille/fichiers')
export class FichiersVerificationVeilleController {
  constructor(
    private readonly service: FichiersVerificationVeilleService,
  ) {}

  @Post('upload')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.MAJOR)
  @UseInterceptors(
    FileInterceptor('fichier', {
      storage: memoryStorage(),
      limits: { fileSize: TAILLE_MAX_FICHIER },
    }),
  )
  @ApiOperation({
    summary:
      "Importer un fichier pour un patient (PDF, image, Office...) — Anesthésiste ou Major",
  })
  upload(
    @UploadedFile() fichier: FichierImporte,
    @Body('patientId') patientId: string,
    @Request() req: any,
  ) {
    if (!patientId) {
      throw new BadRequestException('patientId requis (champ de formulaire).');
    }
    return this.service.upload(fichier, patientId, req.centralUser?.userId);
  }

  @Get()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.MAJOR)
  @ApiOperation({
    summary: 'Lister les fichiers importés pour un patient',
  })
  lister(@Query('patientId') patientId: string) {
    return this.service.listerParPatient(patientId);
  }

  @Get(':id/contenu')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.MAJOR)
  @ApiOperation({
    summary: "Récupérer le contenu (base64) d'un fichier importé",
  })
  async contenu(@Param('id', ParseUUIDPipe) id: string) {
    const fichier = await this.service.trouverAvecContenu(id);
    return {
      id: fichier.id,
      nomOriginal: fichier.nomOriginal,
      mimeType: fichier.mimeType,
      base64: fichier.contenu.toString('base64'),
    };
  }

  @Delete(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.MAJOR)
  @ApiOperation({
    summary: "Supprimer un fichier importé pour un patient",
  })
  supprimer(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.supprimer(id);
  }
}
