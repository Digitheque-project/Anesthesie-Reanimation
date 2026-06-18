import { Injectable, Logger } from '@nestjs/common';
import { ReceivePrescriptionDto } from './dto/receive-prescription.dto';

@Injectable()
export class PrescriptionService {
  private readonly logger = new Logger(PrescriptionService.name);

  async processPrescription(dto: ReceivePrescriptionDto): Promise<boolean> {
    this.logger.log(`📦 Traitement prescription: ${JSON.stringify(dto)}`);
    
    // ICI : tu peux stocker en base, créer une notification, etc.
    // Pour l’instant, on simule le succès
    // Exemple : créer une notification pour l'équipe du bloc
    
    this.logger.log(`✅ Prescription de type ${dto.type} traitée avec succès`);
    return true;
  }
}
