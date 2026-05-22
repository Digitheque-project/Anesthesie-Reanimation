import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProtocoleOperatoireService } from './protocole-operatoire.service';
import { CreateProtocoleOperatoireDto } from './dto/create-protocole-operatoire.dto';
import { UpdateProtocoleOperatoireDto } from './dto/update-protocole-operatoire.dto';

@ApiTags('Protocoles')
@ApiBearerAuth('JWT-auth')
@Controller('protocoles-operatoires')
export class ProtocoleOperatoireController {
  constructor(private readonly service: ProtocoleOperatoireService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un protocole opératoire' })
  create(@Body() dto: CreateProtocoleOperatoireDto) { return this.service.create(dto); }

  @Get()
  @ApiOperation({ summary: 'Lister tous les protocoles' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  findAll(@Query('page') p?: number, @Query('limite') l?: number) { return this.service.findAll(p, l); }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un protocole par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un protocole' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProtocoleOperatoireDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un protocole' })
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
