import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { MedecinService } from './medecin.service';
import { CreateMedecinDto } from './dto/create-medecin.dto';
import { UpdateMedecinDto } from './dto/update-medecin.dto';

@ApiTags('Medecins')
@Controller('medecins')
export class MedecinController {
  constructor(private readonly service: MedecinService) {}
  @Post() @ApiOperation({ summary: 'Créer un médecin' }) create(
    @Body() d: CreateMedecinDto,
  ) {
    return this.service.create(d);
  }
  @Get() @ApiOperation({ summary: 'Lister les médecins' }) findAll(
    @Query('role') r?: string,
    @Query('recherche') s?: string,
  ) {
    return this.service.findAll({ role: r, recherche: s });
  }
  @Get(':id') @ApiOperation({ summary: 'Obtenir un médecin' }) findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(id);
  }
  @Patch(':id') @ApiOperation({ summary: 'Modifier un médecin' }) update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: UpdateMedecinDto,
  ) {
    return this.service.update(id, d);
  }
  @Delete(':id') @ApiOperation({ summary: 'Supprimer un médecin' }) remove(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.remove(id);
  }
}
