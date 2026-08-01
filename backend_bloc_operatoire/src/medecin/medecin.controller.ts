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
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('Medecins')
@Controller('medecins')
export class MedecinController {
  constructor(private readonly service: MedecinService) {}
  @Post()
  @RequireRoleClinique(RoleClinique.MAJOR, RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: 'Créer un médecin (Major, Responsable CPA)' })
  create(@Body() d: CreateMedecinDto) {
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
  @Patch(':id')
  @RequireRoleClinique(RoleClinique.MAJOR, RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: 'Modifier un médecin (Major, Responsable CPA)' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() d: UpdateMedecinDto) {
    return this.service.update(id, d);
  }
  @Delete(':id')
  @RequireRoleClinique(RoleClinique.MAJOR, RoleClinique.RESPONSABLE_CPA)
  @ApiOperation({ summary: 'Supprimer un médecin (Major, Responsable CPA)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
