import { Controller, Get, Post, Body, Headers, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { WebhookNotificationService } from './webhook-notification.service';

@ApiTags('WebhookNotification')
@Controller('webhook-notification')
export class WebhookNotificationController {
  private readonly logger = new Logger(WebhookNotificationController.name);
  constructor(private readonly service: WebhookNotificationService) {}

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
    const result = await this.service.processIncomingNotification(payload, sourceName);
    return { received: true, processed: result, method: 'POST', timestamp: new Date().toISOString() };
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Nombre de notifications non lues (pour la cloche)' })
  async getUnreadCount() {
    const count = await this.service.getUnreadCount();
    return { unread: count };
  }
}
