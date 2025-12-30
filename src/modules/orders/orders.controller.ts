import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get('test')
  test() {
    return {
      message: 'Orders module is working!',
      timestamp: new Date().toISOString(),
      sampleData: [
        { id: 1, name: 'Test Order 1' },
        { id: 2, name: 'Test Order 2' },
      ],
    };
  }

  @Get()
  findAll(@Query() queryDto: QueryOrderDto) {
    return this.ordersService.findAll(queryDto);
  }

  @Get('statistics')
  getStatistics() {
    return this.ordersService.getStatistics();
  }

  @Get('statistics/revenue')
  getRevenueStatistics(@Query('period') period?: string) {
    return this.ordersService.getRevenueStatistics(period);
  }

  @Get('export')
  exportOrders(@Query() queryDto: QueryOrderDto) {
    return this.ordersService.exportOrders(queryDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Patch('bulk/status')
  bulkUpdateStatus(@Body() bulkUpdateDto: BulkUpdateStatusDto) {
    return this.ordersService.bulkUpdateStatus(bulkUpdateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}
