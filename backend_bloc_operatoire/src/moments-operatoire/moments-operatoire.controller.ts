import { Controller, Get, Post, Body, Patch, Param, Query, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MomentsOperatoireService } from './moments-operatoire.service';
import { CreateMomentOperatoireDto } from './dto/create-moment-operatoire.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Moments Opératoires')
@Controller('moments-operatoires')
export class MomentsOperatoireController {
  constructor(private readonly service: MomentsOperatoireService) {}

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.CHIRURGIEN, RoleClinique.IBODE)
  @ApiOperation({ summary: 'Horodater un moment opératoire (Anesthésiste, Chirurgien ou IBODE)' })
  create(@Body() dto: CreateMomentOperatoireDto, @Request() req: any) {
    return this.service.create(dto, req.centralUser);
  }

  @Get()
  @ApiQuery({ name: 'patientId', required: true })
  @ApiQuery({ name: 'inclureAnnules', required: false, type: Boolean })
  @ApiOperation({ summary: 'Lister la chronologie des moments opératoires du patient' })
  findAll(@Query('patientId') patientId: string, @Query('inclureAnnules') inclureAnnules?: string) {
    return this.service.findAll(patientId, inclureAnnules === 'true');
  }

  @Patch(':id/annuler')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.CHIRURGIEN, RoleClinique.IBODE)
  @ApiOperation({ summary: 'Annuler (suppression douce) un moment opératoire horodaté par erreur' })
  annuler(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.service.annuler(id, req.centralUser);
  }
}
