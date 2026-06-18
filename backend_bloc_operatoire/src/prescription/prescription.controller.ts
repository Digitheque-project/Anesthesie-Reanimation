import { Controller, Post, Body, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrescriptionService } from './prescription.service';
import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';

@ApiTags('Prescription')
@Controller('prescription')
export class PrescriptionController {
  private readonly logger = new Logger(PrescriptionController.name);
  constructor(private readonly service: PrescriptionService) {}

  @Post('receive')
  @HttpCode(200)
  @ApiOperation({ summary: '📋 Recevoir une prescription du service Prescription' })
  @ApiResponse({ status: 200, description: 'Prescription reçue avec succès' })
  async receivePrescription(@Body() dto: ReceivePrescriptionDto) {
    this.logger.log(`📋 Prescription reçue du service Prescription pour patient ${dto.patientId}`);
    const result = await this.service.processPrescription(dto);
    return { received: true, processed: result, timestamp: new Date().toISOString() };
  }
}
