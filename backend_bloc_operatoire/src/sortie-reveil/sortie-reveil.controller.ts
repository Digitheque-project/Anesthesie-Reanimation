import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SortieReveilService } from './sortie-reveil.service';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Sorties Réveil')
@ApiBearerAuth('JWT-auth')
@Controller('sorties-reveil')
export class SortieReveilController {
  constructor(private readonly service: SortieReveilService) {}

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Créer une sortie de réveil (Anesthésiste — auto-attribué depuis la session)' })
  create(@Body() dto: CreateSortieReveilDto, @Request() req: any) { return this.service.create(dto, req.centralUser); }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les sorties' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  findAll(@Query('page') p?: number, @Query('limite') l?: number) { return this.service.findAll(p, l); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une sortie par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Modifier une sortie (Anesthésiste)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSortieReveilDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Supprimer une sortie (Anesthésiste)' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
