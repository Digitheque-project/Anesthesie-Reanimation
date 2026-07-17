import { Controller, Get, Param } from '@nestjs/common';
import { ArchivesService } from './archives.service';

@Controller('archives')
export class ArchivesController {
  constructor(private readonly archivesService: ArchivesService) {}

  @Get('dossier/:patientId')
  getDossierComplet(@Param('patientId') patientId: string) {
    return this.archivesService.getDossierComplet(patientId);
  }

  @Get('resume/:patientId')
  getResumePatient(@Param('patientId') patientId: string) {
    return this.archivesService.getResumePatient(patientId);
  }
}
