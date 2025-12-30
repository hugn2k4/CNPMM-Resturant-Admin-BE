import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { BulkUpdateStatusDto } from './dto/bulk-update-status.dto';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: MongoRepository<Order>,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    // Generate unique order number
    const orderNumber = await this.generateOrderNumber();

    const finalAmount =
      createOrderDto.totalAmount + (createOrderDto.shippingFee || 0);

    const order = this.orderRepository.create({
      ...createOrderDto,
      orderNumber,
      finalAmount,
      paymentMethod: (createOrderDto.paymentMethod || 'COD') as 'COD' | 'banking' | 'e-wallet',
      paymentStatus: 'pending' as const,
      orderStatus: 'pending' as const,
    });

    const savedOrder = await this.orderRepository.save(order);
    return savedOrder;
  }

  async findAll(queryDto: QueryOrderDto) {
    const {
      page = 1,
      limit = 20,
      status,
      search,
      startDate,
      endDate,
    } = queryDto;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: any = {};

    if (status && status !== 'all') {
      filter.orderStatus = status;
    }

    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phoneNumber': { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const [orders, total] = await Promise.all([
      this.orderRepository.find({
        where: filter,
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.orderRepository.count(filter),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Order> {
    if (!ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid order ID');
    }

    const order = await this.orderRepository.findOne({
      where: { _id: new ObjectId(id) } as any,
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto): Promise<Order> {
    const order = await this.findOne(id);

    // Update only allowed fields
    if (updateOrderDto.note !== undefined) {
      order.note = updateOrderDto.note;
    }
    if (updateOrderDto.paymentMethod) {
      order.paymentMethod = updateOrderDto.paymentMethod as 'COD' | 'banking' | 'e-wallet';
    }
    if (updateOrderDto.paymentStatus) {
      order.paymentStatus = updateOrderDto.paymentStatus as 'pending' | 'paid' | 'failed';
    }
    if (updateOrderDto.shippingAddress) {
      order.shippingAddress = updateOrderDto.shippingAddress;
    }

    return this.orderRepository.save(order);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
    const order = await this.findOne(id);

    // Validate status transition
    this.validateStatusTransition(
      order.orderStatus,
      updateStatusDto.orderStatus,
    );

    const now = new Date();
    order.orderStatus = updateStatusDto.orderStatus;

    // Update timestamps based on status
    switch (updateStatusDto.orderStatus) {
      case 'confirmed':
        order.confirmedAt = now;
        break;
      case 'preparing':
        order.preparingAt = now;
        break;
      case 'shipping':
        order.shippingAt = now;
        break;
      case 'delivered':
        order.deliveredAt = now;
        order.paymentStatus = 'paid';
        break;
      case 'cancelled':
        order.cancelledAt = now;
        order.cancelReason =
          updateStatusDto.cancelReason || 'No reason provided';
        break;
    }

    return this.orderRepository.save(order);
  }

  async bulkUpdateStatus(bulkUpdateDto: BulkUpdateStatusDto) {
    const { orderIds, orderStatus, cancelReason } = bulkUpdateDto;
    const results = {
      success: [],
      failed: [],
    };

    for (const orderId of orderIds) {
      try {
        await this.updateStatus(orderId, {
          orderStatus,
          cancelReason,
        });
        results.success.push(orderId);
      } catch (error) {
        results.failed.push({
          orderId,
          error: error.message,
        });
      }
    }

    return {
      message: `Updated ${results.success.length} orders, failed ${results.failed.length}`,
      ...results,
    };
  }

  async remove(id: string): Promise<void> {
    const order = await this.findOne(id);
    await this.orderRepository.remove(order);
  }

  async getStatistics() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const [
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippingOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      monthOrders,
      totalRevenue,
    ] = await Promise.all([
      this.orderRepository.count(),
      this.orderRepository.count({ orderStatus: 'pending' }),
      this.orderRepository.count({ orderStatus: 'confirmed' }),
      this.orderRepository.count({ orderStatus: 'shipping' }),
      this.orderRepository.count({ orderStatus: 'delivered' }),
      this.orderRepository.count({ orderStatus: 'cancelled' }),
      this.orderRepository.count({
        createdAt: { $gte: startOfDay } as any,
      }),
      this.orderRepository.count({
        createdAt: { $gte: startOfMonth } as any,
      }),
      this.calculateRevenue(),
    ]);

    return {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippingOrders,
      deliveredOrders,
      cancelledOrders,
      todayOrders,
      monthOrders,
      totalRevenue,
    };
  }

  async getRevenueStatistics(period: string = '7days') {
    const now = new Date();
    let startDate: Date;
    let groupFormat: string;

    switch (period) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = 'daily';
        break;
      case '30days':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        groupFormat = 'daily';
        break;
      case '12months':
        startDate = new Date(now.getFullYear(), now.getMonth() - 12, 1);
        groupFormat = 'monthly';
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        groupFormat = 'daily';
    }

    const orders = await this.orderRepository.find({
      where: {
        orderStatus: 'delivered',
        createdAt: { $gte: startDate } as any,
      },
      order: { createdAt: 'ASC' },
    });

    // Group by date
    const revenueByDate = new Map<string, number>();
    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      let key: string;

      if (groupFormat === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      }

      revenueByDate.set(key, (revenueByDate.get(key) || 0) + order.finalAmount);
    });

    const data = Array.from(revenueByDate.entries()).map(([date, revenue]) => ({
      date,
      revenue,
      count: orders.filter((o) => {
        const d = new Date(o.createdAt);
        const key =
          groupFormat === 'monthly'
            ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
            : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return key === date;
      }).length,
    }));

    return {
      period,
      data,
      totalRevenue: Array.from(revenueByDate.values()).reduce(
        (sum, val) => sum + val,
        0,
      ),
      totalOrders: orders.length,
    };
  }

  async exportOrders(queryDto: QueryOrderDto) {
    const { orders } = await this.findAll(queryDto);

    const exportData = orders.map((order) => ({
      orderNumber: order.orderNumber,
      customerName: order.shippingAddress.fullName,
      phone: order.shippingAddress.phoneNumber,
      address: `${order.shippingAddress.address}, ${order.shippingAddress.ward || ''}, ${order.shippingAddress.district || ''}, ${order.shippingAddress.city || ''}`,
      items: order.items
        .map((item) => `${item.name} x${item.quantity}`)
        .join(', '),
      totalAmount: order.totalAmount,
      shippingFee: order.shippingFee,
      finalAmount: order.finalAmount,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      note: order.note || '',
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt || '',
    }));

    return {
      data: exportData,
      total: exportData.length,
      message: 'Export successful',
    };
  }

  private async calculateRevenue(): Promise<number> {
    const deliveredOrders = await this.orderRepository.find({
      where: { orderStatus: 'delivered' },
    });

    return deliveredOrders.reduce((sum, order) => sum + order.finalAmount, 0);
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    // Count orders today
    const startOfDay = new Date(year, date.getMonth(), date.getDate());
    const count = await this.orderRepository.count({
      createdAt: { $gte: startOfDay } as any,
    });

    const sequence = String(count + 1).padStart(4, '0');
    return `ORD${year}${month}${day}${sequence}`;
  }

  private validateStatusTransition(
    currentStatus: string,
    newStatus: string,
  ): void {
    const validTransitions: Record<string, string[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['preparing', 'cancelled'],
      preparing: ['shipping', 'cancelled'],
      shipping: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }
}
