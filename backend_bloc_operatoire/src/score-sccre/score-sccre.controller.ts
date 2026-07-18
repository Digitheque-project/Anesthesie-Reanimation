import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Request, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ScoreSCCREService } from './score-sccre.service';
import { CreateScoreSCCREDto } from './dto/create-score-sccre.dto';
import { UpdateScoreSCCREDto } from './dto/update-score-sccre.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Scores SCCRE')
@ApiBearerAuth('JWT-auth')
@Controller('scores-sccre')
export class ScoreSCCREController {
  constructor(private readonly service: ScoreSCCREService) {}

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Créer un score SCCRE (Anesthésiste — auto-attribué depuis la session)' })
  create(@Body() dto: CreateScoreSCCREDto, @Request() req: any) { return this.service.create(dto, req.centralUser); }

  @Get()
  @ApiOperation({ summary: 'Lister tous les scores' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  findAll(@Query('page') p?: number, @Query('limite') l?: number) { return this.service.findAll(p, l); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un score par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un score' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateScoreSCCREDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un score' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
