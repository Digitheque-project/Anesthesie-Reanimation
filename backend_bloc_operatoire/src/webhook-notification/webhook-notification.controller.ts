import { Controller, Post, Get, Body, Query, Headers, HttpCode, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { WebhookNotificationService } from './webhook-notification.service';
import { ReceiveNotificationDto } from './dto/receive-notification.dto';

@ApiTags('WebhookNotification')
@Controller('webhook-notification')
export class WebhookNotificationController {
  private readonly logger = new Logger(WebhookNotificationController.name);
  constructor(private readonly service: WebhookNotificationService) {}

  @Post()
  @HttpCode(200)
  @ApiOperation({ summary: '📨 Recevoir une notification externe (POST) - Format standard' })
  @ApiBody({ type: ReceiveNotificationDto, description: 'Notification au format standard' })
  @ApiResponse({ status: 200, description: 'Notification reçue avec succès' })
  async receivePost(
    @Body() payload: ReceiveNotificationDto,
    @Headers('x-notification-service') source?: string,
  ) {
    const sourceName = source || payload.sourceServiceName || 'service externe';
    this.logger.log(`📨 POST notification reçue de ${sourceName}`);
    const result = await this.service.processIncomingNotification(payload, sourceName);
    return { received: true, processed: result, method: 'POST', timestamp: new Date().toISOString() };
  }

  @Get()
  @ApiOperation({ summary: '🔔 Recevoir une notification externe via GET (legacy)' })
  @ApiQuery({ name: 'type', required: true })
  @ApiQuery({ name: 'targetId', required: true })
  @ApiQuery({ name: 'message', required: true })
  @ApiQuery({ name: 'source', required: false })
  async receiveGet(
    @Query('type') type: string,
    @Query('targetId') targetId: string,
    @Query('message') message: string,
    @Query('source') source?: string,
  ) {
    const payload = { type, targetId, message, source };
    const result = await this.service.processIncomingNotification(payload, source || 'GET');
    return { received: true, processed: result, method: 'GET', timestamp: new Date().toISOString() };
  }
}
