import { Controller, Get } from '@nestjs/common';
import { NotificationAlerteService } from './notification-alerte.service';

@Controller('alertes')
export class NotificationAlerteController {
  constructor(private readonly service: NotificationAlerteService) {}

  @Get()
  getAlertes() { return this.service.getAlertesUrgentes(); }

  @Get('resume-jour')
  getResumeJour() { return this.service.getResumeJour(); }
}
