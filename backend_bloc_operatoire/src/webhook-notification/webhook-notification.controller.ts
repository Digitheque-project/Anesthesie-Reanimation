import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  HttpCode,
  Logger,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { WebhookNotificationService } from './webhook-notification.service';
import { Public } from '../central-auth/public.decorator';

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

  @Get('unread/count')
  @ApiOperation({ summary: 'Nombre de notifications non lues' })
  async getUnreadCount() {
    const count = await this.service.getUnreadCount();
    return { unread: count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir les détails d’une notification par ID' })
  async getNotification(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }
}
