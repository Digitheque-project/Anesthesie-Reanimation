import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { TracabiliteService } from './tracabilite.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tracabilite')
@UseGuards(JwtAuthGuard)
export class TracabiliteController {
  constructor(private readonly service: TracabiliteService) {}

  @Get(':entite/:entiteId')
  getHistorique(@Param('entite') entite: string, @Param('entiteId') entiteId: string) {
    return this.service.getHistorique(entite, entiteId);
  }

  @Get()
  getTous(@Query('page') page?: number, @Query('limite') limite?: number) {
    return this.service.getTousHistoriques(page, limite);
  }
}
