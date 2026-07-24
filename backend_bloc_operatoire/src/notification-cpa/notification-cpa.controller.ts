import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { NotificationCPAService } from './notification-cpa.service';
import { CreateNotificationCPADto } from './dto/create-notification-cpa.dto';
import { UpdateNotificationCPADto } from './dto/update-notification-cpa.dto';

@ApiTags('Notifications')
@Controller('notifications-cpa')
export class NotificationCPAController {
  constructor(private readonly service: NotificationCPAService) {}

  @Post()
  @ApiOperation({ summary: 'Créer une notification' })
  create(@Body() d: CreateNotificationCPADto) {
    return this.service.create(d);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les notifications' })
  findAll(@Query('page') p?: number, @Query('limite') l?: number) {
    return this.service.findAll(p, l);
  }

  @Get('unread/count')
  @ApiOperation({
    summary: 'Nombre de notifications non lues (pour la cloche)',
  })
  async getUnreadCount() {
    const count = await this.service.getUnreadCount();
    return { unread: count };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une notification' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une notification' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() d: UpdateNotificationCPADto,
  ) {
    return this.service.update(id, d);
  }

  @Patch(':id/planifier')
  @ApiOperation({ summary: 'Planifier un RDV' })
  planifier(@Param('id', ParseUUIDPipe) id: string, @Body() dto: any) {
    return this.service.planifierRDV(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une notification' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
