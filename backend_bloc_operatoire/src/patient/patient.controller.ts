import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

@ApiTags('Patients')
@ApiBearerAuth('JWT-auth')
@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un patient' })
  create(@Body() createPatientDto: CreatePatientDto) {
    return this.patientService.create(createPatientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister tous les patients' })
  @ApiQuery({ name: 'statut', required: false })
  @ApiQuery({ name: 'niveauUrgence', required: false })
  @ApiQuery({ name: 'recherche', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limite', required: false })
  findAll(
    @Query('statut') statut?: string,
    @Query('niveauUrgence') niveauUrgence?: string,
    @Query('recherche') recherche?: string,
    @Query('page') page?: number,
    @Query('limite') limite?: number,
  ) {
    return this.patientService.findAll({ statut, niveauUrgence, recherche, page, limite });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un patient par ID' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un patient' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un patient' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.patientService.remove(id);
  }
}
