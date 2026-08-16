import { Controller, Post, Get, Param, Body, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';
import { Public } from '../central-auth/public.decorator';

@ApiTags('Prescription')
@ApiBearerAuth('JWT-auth')
@Controller('prescription')
export class PrescriptionController {
  private readonly logger = new Logger(PrescriptionController.name);
  constructor(private readonly service: PrescriptionService) {}

  // Webhook entrant appelé par le service Prescriptions — pas un utilisateur du SSO central.
  @Public()
  @Post('receive')
  @HttpCode(200)
  @ApiOperation({
    summary: '📋 Recevoir une prescription du service Prescription',
  })
  @ApiResponse({ status: 200, description: 'Prescription reçue avec succès' })
  async receivePrescription(@Body() dto: ReceivePrescriptionDto) {
    this.logger.log(
      `📋 Prescription reçue du service Prescription pour patient ${dto.patientId}`,
    );
    const result = await this.service.processPrescription(dto);
    return {
      received: true,
      processed: result,
      timestamp: new Date().toISOString(),
    };
  }

  // Lecture pour les autres services de la plateforme : médicaments retenus pendant la CPA la
  // plus récente du patient (prémédication + anesthésie/réanimation), sans avoir à interroger la
  // fiche CPA complète (voir PrescriptionService.getPrescriptionCpa).
  @Get(':patientId')
  @ApiOperation({
    summary:
      "Prescription d'anesthésie d'un patient (médicaments retenus lors de sa CPA la plus récente) — lecture pour les autres services",
  })
  getPrescriptionCpa(@Param('patientId') patientId: string) {
    return this.service.getPrescriptionCpa(patientId);
  }
}
