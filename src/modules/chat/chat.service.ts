import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { MongoRepository } from 'typeorm';
import { ChatMessage } from './entities/message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatMessage)
    private chatRepository: MongoRepository<ChatMessage>,
  ) {}

  /**
   * Get all conversations for admin dashboard
   * Groups messages by userId and shows latest message + unread count
   */
  async getAdminConversations() {
    try {
      const conversations = await this.chatRepository
        .aggregate([
          {
            $sort: { createdAt: -1 },
          },
          {
            $group: {
              _id: '$userId',
              lastMessage: { $first: '$message' },
              lastMessageTime: { $first: '$createdAt' },
              lastSenderType: { $first: '$senderType' },
              unreadCount: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $eq: ['$senderType', 'user'] },
                        { $eq: ['$isRead', false] },
                      ],
                    },
                    1,
                    0,
                  ],
                },
              },
            },
          },
          {
            $sort: { lastMessageTime: -1 },
          },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user',
            },
          },
          {
            $unwind: '$user',
          },
          {
            $project: {
              userId: '$_id',
              lastMessage: 1,
              lastMessageTime: 1,
              lastSenderType: 1,
              unreadCount: 1,
              user: {
                _id: '$user._id',
                fullName: '$user.fullName',
                email: '$user.email',
                avatar: '$user.avatar',
                image: '$user.image',
              },
            },
          },
        ])
        .toArray();

      return conversations;
    } catch (error) {
      throw new Error(`Error getting conversations: ${error.message}`);
    }
  }

  /**
   * Get chat history between admin and a specific user
   */
  async getUserChatHistory(userId: string, limit = 50, skip = 0) {
    try {
      const messages = await this.chatRepository.find({
        where: {
          userId: new ObjectId(userId),
        } as any,
        order: {
          createdAt: 'DESC',
        },
        take: limit,
        skip: skip,
      });

      // Reverse to show oldest first
      return messages.reverse();
    } catch (error) {
      throw new Error(`Error getting chat history: ${error.message}`);
    }
  }

  /**
   * Mark messages as read by admin
   */
  async markMessagesAsRead(messageIds: string[]) {
    try {
      const objectIds = messageIds.map((id) => new ObjectId(id));

      const result = await this.chatRepository.updateMany(
        {
          _id: { $in: objectIds },
          isRead: false,
        } as any,
        {
          $set: {
            isRead: true,
            readAt: new Date(),
          },
        },
      );

      return result;
    } catch (error) {
      throw new Error(`Error marking messages as read: ${error.message}`);
    }
  }

  /**
   * Save a new message from user
   */
  async saveUserMessage(userId: string, message: string) {
    try {
      const chatMessage = this.chatRepository.create({
        userId: new ObjectId(userId),
        message: message.trim(),
        senderType: 'user',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.chatRepository.save(chatMessage);
    } catch (error) {
      throw new Error(`Error saving user message: ${error.message}`);
    }
  }

  /**
   * Save a new message from admin to user
   */
  async saveAdminMessage(userId: string, message: string) {
    try {
      const chatMessage = this.chatRepository.create({
        userId: new ObjectId(userId),
        message: message.trim(),
        senderType: 'admin',
        isRead: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return await this.chatRepository.save(chatMessage);
    } catch (error) {
      throw new Error(`Error saving admin message: ${error.message}`);
    }
  }

  /**
   * Delete entire conversation with a user
   */
  async deleteConversation(userId: string) {
    try {
      const result = await this.chatRepository.deleteMany({
        userId: new ObjectId(userId),
      } as any);

      return result;
    } catch (error) {
      throw new Error(`Error deleting conversation: ${error.message}`);
    }
  }
}
