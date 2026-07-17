import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VerificationVeilleService } from './verification-veille.service';
import { CreateVerificationVeilleDto } from './dto/create-verification-veille.dto';
import { UpdateVerificationVeilleDto } from './dto/update-verification-veille.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Vérification veille')
@Controller('verification-veille')
export class VerificationVeilleController {
  constructor(private readonly service: VerificationVeilleService) {}

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: "Créer une vérification à la veille de l'intervention (Anesthésiste)" })
  create(@Body() d: CreateVerificationVeilleDto) { return this.service.create(d); }

  @Get() @ApiOperation({ summary: 'Lister les vérifications veille' }) findAll(@Query('page') p?: number, @Query('limite') l?: number) { return this.service.findAll(p, l); }
  @Get(':id') @ApiOperation({ summary: 'Obtenir une vérification veille' }) findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Modifier une vérification veille (Anesthésiste)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() d: UpdateVerificationVeilleDto) { return this.service.update(id, d); }

  @Delete(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Supprimer une vérification veille (Anesthésiste)' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
