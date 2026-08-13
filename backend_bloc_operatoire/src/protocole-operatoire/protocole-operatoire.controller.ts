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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ProtocoleOperatoireService } from './protocole-operatoire.service';
import { CreateProtocoleOperatoireDto } from './dto/create-protocole-operatoire.dto';
import { UpdateProtocoleOperatoireDto } from './dto/update-protocole-operatoire.dto';
import { RequireRoleClinique } from '../central-auth/require-role.decorator';
import { RequirePermission } from '../central-auth/require-permission.decorator';
import { RoleClinique } from '../central-auth/role-clinique';

// Permission du catalogue central ouvrant la LECTURE transversale du programme operatoire aux
// autres services du CHU (clinique-front). L'ecriture reste reservee a l'Anesthesiste.
const LECTURE_PROTOCOLE = 'protocole-operatoire:read';

@ApiTags('Protocoles')
@ApiBearerAuth('JWT-auth')
@Controller('protocoles-operatoires')
export class ProtocoleOperatoireController {
  constructor(private readonly service: ProtocoleOperatoireService) {}

  @Post()
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({
    summary:
      'Creer un protocole anesthesique (Anesthesiste)',
  })
  create(@Body() dto: CreateProtocoleOperatoireDto, @Request() req: any) {
    return this.service.create(dto, req.centralUser);
  }

  @Get()
  @RequirePermission(LECTURE_PROTOCOLE)
  @ApiOperation({
    summary:
      'Lister tous les protocoles (membre du bloc ou permission protocole-operatoire:read)',
  })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  @ApiQuery({ name: 'patientId', required: false })
  findAll(
    @Query('page') p?: number,
    @Query('limite') l?: number,
    @Query('patientId') patientId?: string,
  ) {
    return this.service.findAll(p, l, patientId);
  }

  @Get(':id')
  @RequirePermission(LECTURE_PROTOCOLE)
  @ApiOperation({
    summary:
      'Obtenir un protocole par ID (membre du bloc ou permission protocole-operatoire:read)',
  })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Modifier un protocole (Anesthesiste)' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProtocoleOperatoireDto,
    @Request() req: any,
  ) {
    return this.service.update(id, dto, req.centralUser);
  }

  @Delete(':id')
  @RequireRoleClinique(RoleClinique.ANESTHESISTE)
  @ApiOperation({ summary: 'Supprimer un protocole (Anesthesiste)' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
