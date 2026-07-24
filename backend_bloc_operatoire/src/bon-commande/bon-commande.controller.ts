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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { BonCommandeService } from './bon-commande.service';
import { CreateBonCommandeDto } from './dto/create-bon-commande.dto';
import { UpdateBonCommandeDto } from './dto/update-bon-commande.dto';

@ApiTags('Bons Commande')
@ApiBearerAuth('JWT-auth')
@Controller('bons-commande')
export class BonCommandeController {
  constructor(private readonly service: BonCommandeService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un bon de commande' })
  create(@Body() dto: CreateBonCommandeDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les bons de commande' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  findAll(@Query('page') p?: number, @Query('limite') l?: number) {
    return this.service.findAll(p, l);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un bon par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un bon' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBonCommandeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un bon' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
