import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { ObjectId } from 'mongodb';
import { Notification } from './entities/notification.entity';
import { User } from '../customers/entities/user.entity';
import {
  CreateNotificationDto,
  SendToUserDto,
  SendToMultipleDto,
} from './dto/create-notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: MongoRepository<Notification>,
    @InjectRepository(User)
    private userRepository: MongoRepository<User>,
  ) {}

  // Lấy tất cả thông báo (cho admin xem)
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      this.notificationRepository.find({
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      }),
      this.notificationRepository.count(),
    ]);

    // Lấy thông tin user cho mỗi notification
    const notificationsWithUser = await Promise.all(
      notifications.map(async (notification) => {
        const user = await this.userRepository.findOne({
          where: { _id: notification.userId as any },
        });
        return {
          ...notification,
          user: user
            ? {
                _id: user._id,
                email: user.email,
                fullName: user.fullName,
              }
            : null,
        };
      }),
    );

    return {
      notifications: notificationsWithUser,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Gửi thông báo cho 1 user cụ thể
  async sendToUser(dto: SendToUserDto) {
    const user = await this.userRepository.findOne({
      where: { _id: new ObjectId(dto.userId) as any },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const notification = this.notificationRepository.create({
      userId: new ObjectId(dto.userId),
      type: dto.type,
      title: dto.title,
      message: dto.message,
      data: dto.data || {},
      isRead: false,
      emailSent: false,
    });

    const saved = await this.notificationRepository.save(notification);

    return {
      notification: saved,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  // Gửi thông báo cho nhiều users
  async sendToMultiple(dto: SendToMultipleDto) {
    const notifications: Notification[] = [];

    for (const userId of dto.userIds) {
      const user = await this.userRepository.findOne({
        where: { _id: new ObjectId(userId) as any },
      });

      if (user) {
        const notification = this.notificationRepository.create({
          userId: new ObjectId(userId),
          type: dto.type,
          title: dto.title,
          message: dto.message,
          data: dto.data || {},
          isRead: false,
          emailSent: false,
        });
        notifications.push(notification);
      }
    }

    const saved = await this.notificationRepository.save(notifications);

    return {
      count: saved.length,
      notifications: saved,
    };
  }

  // Gửi thông báo cho tất cả users (role = user hoặc USER)
  async sendToAll(dto: CreateNotificationDto) {
    // Lấy tất cả customers (không phải admin)
    const users = await this.userRepository.find({
      where: {
        $or: [{ role: 'USER' }, { role: 'user' }],
      } as any,
    });

    if (users.length === 0) {
      return {
        count: 0,
        notifications: [],
        message: 'No users found to send notifications',
      };
    }

    const notifications: Notification[] = users.map((user) =>
      this.notificationRepository.create({
        userId: user._id,
        type: dto.type,
        title: dto.title,
        message: dto.message,
        data: dto.data || {},
        isRead: false,
        emailSent: false,
      }),
    );

    const saved = await this.notificationRepository.save(notifications);

    return {
      count: saved.length,
      notifications: saved,
      message: `Sent to ${saved.length} users`,
    };
  }

  // Xóa thông báo
  async remove(id: string) {
    const notification = await this.notificationRepository.findOne({
      where: { _id: new ObjectId(id) as any },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    await this.notificationRepository.delete({ _id: new ObjectId(id) as any });

    return { message: 'Notification deleted successfully' };
  }

  // Thống kê thông báo
  async getStats() {
    const [total, unread, today] = await Promise.all([
      this.notificationRepository.count(),
      this.notificationRepository.count({ where: { isRead: false } }),
      this.notificationRepository.count({
        where: {
          createdAt: {
            $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        } as any,
      }),
    ]);

    return {
      total,
      unread,
      sentToday: today,
    };
  }
}
