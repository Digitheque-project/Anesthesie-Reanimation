import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RapportsService } from './rapports.service';

@ApiTags('Rapports')
@Controller('rapports')
export class RapportsController {
  constructor(private readonly rapportsService: RapportsService) {}

  @Get('statistiques')
  @ApiOperation({ summary: 'Statistiques globales' })
  statistiques(@Query('dateDebut') dd?: string, @Query('dateFin') df?: string) {
    return this.rapportsService.statistiquesGenerales(dd, df);
  }

  @Get('activite-chirurgiens')
  @ApiOperation({ summary: 'Activité par chirurgien' })
  activiteChirurgiens(@Query('dateDebut') dd?: string, @Query('dateFin') df?: string) {
    return this.rapportsService.activiteParChirurgien(dd, df);
  }

  @Get('cpa-en-attente')
  @ApiOperation({ summary: 'CPA en attente' })
  cpaEnAttente() { return this.rapportsService.cpaEnAttente(); }

  @Get('taux-occupation')
  @ApiOperation({ summary: 'Taux d\'occupation' })
  tauxOccupation() { return this.rapportsService.tauxOccupation(); }

  @Get('export')
  @ApiOperation({ summary: 'Export statistiques' })
  exportStats() { return this.rapportsService.exportStatistiques('excel'); }
}
