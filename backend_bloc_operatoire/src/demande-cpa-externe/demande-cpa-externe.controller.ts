import { Controller, Get, Post, Body, Patch, Param, Query, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { DemandeCpaExterneService } from './demande-cpa-externe.service';
import { ReceiveDemandeCpaDto } from './dto/receive-demande-cpa.dto';
import { UpdateDemandeCpaDto } from './dto/update-demande-cpa.dto';
import { StatutDemandeCpaExterne } from '../entities/demande-cpa-externe.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../central-auth/public.decorator';

@ApiTags('Demandes CPA externes')
@Controller('demandes-cpa-externes')
export class DemandeCpaExterneController {
  constructor(private readonly service: DemandeCpaExterneService) {}

  // Webhook entrant appelé par un service externe (ex: Endoscopie) — pas un utilisateur du SSO central.
  @Public()
  @Post('receive')
  @HttpCode(200)
  @ApiOperation({ summary: '📋 Recevoir une demande de CPA/VPA d\'un service externe (ex: Endoscopie)' })
  @ApiResponse({ status: 200, description: 'Demande reçue avec succès' })
  async receive(@Body() dto: ReceiveDemandeCpaDto) {
    const demande = await this.service.receive(dto);
    return { received: true, id: demande.id, statut: demande.statut, timestamp: new Date().toISOString() };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Lister les demandes de CPA externes' })
  @ApiQuery({ name: 'statut', required: false, enum: StatutDemandeCpaExterne })
  findAll(@Query('statut') statut?: StatutDemandeCpaExterne) {
    return this.service.findAll(statut);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Obtenir une demande de CPA externe' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Planifier / mettre à jour une demande de CPA externe' })
  update(@Param('id') id: string, @Body() dto: UpdateDemandeCpaDto) {
    return this.service.update(id, dto);
  }
}
