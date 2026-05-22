import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SortieReveilService } from './sortie-reveil.service';
import { CreateSortieReveilDto } from './dto/create-sortie-reveil.dto';
import { UpdateSortieReveilDto } from './dto/update-sortie-reveil.dto';

@ApiTags('Sorties Réveil')
@ApiBearerAuth('JWT-auth')
@Controller('sorties-reveil')
export class SortieReveilController {
  constructor(private readonly service: SortieReveilService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une sortie de réveil' })
  create(@Body() dto: CreateSortieReveilDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Lister toutes les sorties' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  findAll(@Query('page') p?: number, @Query('limite') l?: number) { return this.service.findAll(p, l); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une sortie par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une sortie' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSortieReveilDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une sortie' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
