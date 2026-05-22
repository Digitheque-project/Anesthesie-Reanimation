import { Controller, Get, UseGuards } from '@nestjs/common';
import { NotificationAlerteService } from './notification-alerte.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('alertes')
@UseGuards(JwtAuthGuard)
export class NotificationAlerteController {
  constructor(private readonly service: NotificationAlerteService) {}

  @Get()
  getAlertes() { return this.service.getAlertesUrgentes(); }

  @Get('resume-jour')
  getResumeJour() { return this.service.getResumeJour(); }
}
