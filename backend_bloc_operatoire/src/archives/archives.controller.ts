import { Controller, Get, Param, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { ArchivesService } from './archives.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('archives')
@UseGuards(JwtAuthGuard)
export class ArchivesController {
  constructor(private readonly archivesService: ArchivesService) {}

  @Get('dossier/:patientId')
  getDossierComplet(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.archivesService.getDossierComplet(patientId);
  }

  @Get('resume/:patientId')
  getResumePatient(@Param('patientId', ParseUUIDPipe) patientId: string) {
    return this.archivesService.getResumePatient(patientId);
  }
}
