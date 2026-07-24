import { Controller, Get, Post, Body, Request } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MomentsCatalogueService } from './moments-catalogue.service';
import { CreateMomentCatalogueEntryDto } from './dto/create-moment-catalogue-entry.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Catalogue des moments opératoires')
@Controller('moments-catalogue')
export class MomentsCatalogueController {
  constructor(private readonly service: MomentsCatalogueService) {}

  @Get()
  @ApiOperation({
    summary: 'Lister le catalogue des boutons de la chronologie opératoire',
  })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE, RoleClinique.IBODE)
  @ApiOperation({
    summary:
      'Ajouter un bouton réutilisable au catalogue (à sa propre catégorie)',
  })
  create(@Body() dto: CreateMomentCatalogueEntryDto, @Request() req: any) {
    return this.service.create(dto, req.centralUser);
  }
}
