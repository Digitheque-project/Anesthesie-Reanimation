import { Controller, Post, Body, Headers, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookNotificationService } from './webhook-notification.service';
import { Public } from '../central-auth/public.decorator';

// La lecture (compteur non lu, détail par id) est volontairement absente ici : elle serait
// redondante avec /notifications-cpa, qui fusionne déjà le contenu de WebhookNotification dans
// sa propre liste et son propre compteur (voir NotificationCPAService). Seul le point d'entrée
// webhook lui-même reste, au cas où un service externe l'utilise encore pour écrire.
@ApiTags('WebhookNotification')
@Controller('webhook-notification')
export class WebhookNotificationController {
  private readonly logger = new Logger(WebhookNotificationController.name);
  constructor(private readonly service: WebhookNotificationService) {}

  // Webhook entrant appelé par d'autres services — pas un utilisateur du SSO central.
  @Public()
  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '📨 Recevoir une notification externe' })
  @ApiResponse({ status: 200, description: 'Notification reçue avec succès' })
  async receivePost(
    @Body() payload: any,
    @Headers('x-notification-service') source?: string,
  ) {
    const sourceName = source || payload.sourceServiceName || 'service externe';
    this.logger.log(`📨 POST notification reçue de ${sourceName}`);
    const result = await this.service.processIncomingNotification(
      payload,
      sourceName,
    );
    return {
      received: true,
      processed: result,
      method: 'POST',
      timestamp: new Date().toISOString(),
    };
  }
}
