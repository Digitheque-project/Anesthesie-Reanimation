import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CPAService } from './cpa.service';
import { CreateCPADto } from './dto/create-cpa.dto';
import { UpdateCPADto } from './dto/update-cpa.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

@ApiTags('CPA')
@Controller('cpa')
export class CPAController {
  constructor(private readonly service: CPAService) {}

  @Post()
  @RequireRoleClinique(
    RoleClinique.ANESTHESISTE,
    RoleClinique.RESPONSABLE_CPA,
    RoleClinique.MAJOR,
  )
  @ApiOperation({
    summary:
      "Créer une CPA — décision Apte/Inapte/Report (Anesthésiste, Responsable CPA ou Major ; l'anesthésiste ayant réalisé la consultation est auto-attribué depuis la session si elle est ANESTHESISTE, sinon doit être sélectionné explicitement)",
  })
  create(@Body() d: CreateCPADto, @Request() req: any) {
    return this.service.create(d, req.centralUser);
  }

  @Get() @ApiOperation({ summary: 'Lister les CPA' }) findAll(
    @Query('page') p?: number,
    @Query('limite') l?: number,
    @Query('patientId') patientId?: string,
  ) {
    return this.service.findAll(p, l, patientId);
  }
  @Get(':id') @ApiOperation({ summary: 'Obtenir une CPA' }) findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequireRoleClinique(
    RoleClinique.ANESTHESISTE,
    RoleClinique.RESPONSABLE_CPA,
    RoleClinique.MAJOR,
  )
  @ApiOperation({
    summary: 'Modifier une CPA (Anesthésiste, Responsable CPA ou Major)',
  })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() d: UpdateCPADto) {
    return this.service.update(id, d);
  }

  @Delete(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Supprimer une CPA (Anesthésiste)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
