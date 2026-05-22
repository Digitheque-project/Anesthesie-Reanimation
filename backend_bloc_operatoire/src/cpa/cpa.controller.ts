import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CPAService } from './cpa.service';
import { CreateCPADto } from './dto/create-cpa.dto';
import { UpdateCPADto } from './dto/update-cpa.dto';

@ApiTags('CPA')
@Controller('cpa')
export class CPAController {
  constructor(private readonly service: CPAService) {}
  @Post() @ApiOperation({ summary: 'Créer une CPA' }) create(@Body() d: CreateCPADto) { return this.service.create(d); }
  @Get() @ApiOperation({ summary: 'Lister les CPA' }) findAll(@Query('page') p?: number, @Query('limite') l?: number) { return this.service.findAll(p, l); }
  @Get(':id') @ApiOperation({ summary: 'Obtenir une CPA' }) findOne(@Param('id', ParseUUIDPipe) id: string) { return this.service.findOne(id); }
  @Patch(':id') @ApiOperation({ summary: 'Modifier une CPA' }) update(@Param('id', ParseUUIDPipe) id: string, @Body() d: UpdateCPADto) { return this.service.update(id, d); }
  @Delete(':id') @ApiOperation({ summary: 'Supprimer une CPA' }) remove(@Param('id', ParseUUIDPipe) id: string) { return this.service.remove(id); }
}
