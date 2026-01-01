import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationDto,
  SendToUserDto,
  SendToMultipleDto,
} from './dto/create-notification.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // GET /api/notifications - Lấy danh sách tất cả thông báo
  @Get()
  findAll(@Query('page') page = '1', @Query('limit') limit = '20') {
    return this.notificationsService.findAll(parseInt(page), parseInt(limit));
  }

  // GET /api/notifications/stats - Lấy thống kê
  @Get('stats')
  getStats() {
    return this.notificationsService.getStats();
  }

  // POST /api/notifications/send-to-user - Gửi cho 1 user
  @Post('send-to-user')
  sendToUser(@Body() dto: SendToUserDto) {
    return this.notificationsService.sendToUser(dto);
  }

  // POST /api/notifications/send-to-multiple - Gửi cho nhiều users
  @Post('send-to-multiple')
  sendToMultiple(@Body() dto: SendToMultipleDto) {
    return this.notificationsService.sendToMultiple(dto);
  }

  // POST /api/notifications/send-to-all - Gửi cho tất cả users
  @Post('send-to-all')
  sendToAll(@Body() dto: CreateNotificationDto) {
    return this.notificationsService.sendToAll(dto);
  }

  // DELETE /api/notifications/:id - Xóa thông báo
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(id);
  }
}
