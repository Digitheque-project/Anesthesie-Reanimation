import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PharmacieClient } from '../external/pharmacie.client';

@ApiTags('Pharmacie')
@Controller('pharmacie')
export class PharmacieController {
  constructor(private readonly pharmacieClient: PharmacieClient) {}

  @Get('prix')
  @ApiOperation({
    summary:
      "Catalogue des prix Pharmacie (proxy, mis en cache) — pour le rapprochement des médicaments d'anesthésie/réanimation",
  })
  getPrix() {
    return this.pharmacieClient.getStockSalePrices();
  }
}
