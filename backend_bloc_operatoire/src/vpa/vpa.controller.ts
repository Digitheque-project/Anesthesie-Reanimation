import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { VPAService } from './vpa.service';
import { CreateVPADto } from './dto/create-vpa.dto';
import { UpdateVPADto } from './dto/update-vpa.dto';

@ApiTags('VPA')
@Controller('vpa')
export class VPAController {
  constructor(private readonly service: VPAService) {}
  @Post() @ApiOperation({ summary: 'Créer une VPA' }) create(@Body() d: CreateVPADto) { return this.service.create(d); }
  @Get() @ApiOperation({ summary: 'Lister les VPA' }) findAll(@Query('page') p?: number, @Query('limite') l?: number) { return this.service.findAll(p, l); }
  @Get(':id') @ApiOperation({ summary: 'Obtenir une VPA' }) findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }
  @Patch(':id') @ApiOperation({ summary: 'Modifier une VPA' }) update(@Param('id', ParseUUIDPipe) id: string, @Body() d: UpdateVPADto) { return this.service.update(id, d); }
  @Delete(':id') @ApiOperation({ summary: 'Supprimer une VPA' }) remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
