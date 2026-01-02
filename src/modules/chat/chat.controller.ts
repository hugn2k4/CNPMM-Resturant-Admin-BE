import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * GET /api/chat/admin/conversations
   * Get all conversations for admin dashboard
   */
  @Get('admin/conversations')
  async getAdminConversations() {
    const conversations = await this.chatService.getAdminConversations();
    return {
      success: true,
      data: conversations,
    };
  }

  /**
   * GET /api/chat/admin/:userId
   * Get chat history with a specific user
   */
  @Get('admin/:userId')
  async getUserChatHistory(
    @Param('userId') userId: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    const messages = await this.chatService.getUserChatHistory(
      userId,
      limit ? parseInt(limit) : 50,
      skip ? parseInt(skip) : 0,
    );

    return {
      success: true,
      data: messages,
    };
  }

  /**
   * PATCH /api/chat/read
   * Mark messages as read
   */
  @Patch('read')
  async markAsRead(@Body() body: { messageIds: string[] }) {
    const { messageIds } = body;

    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return {
        success: false,
        message: 'messageIds array is required',
      };
    }

    await this.chatService.markMessagesAsRead(messageIds);

    return {
      success: true,
      message: 'Messages marked as read',
    };
  }

  /**
   * POST /api/chat/admin/send
   * Send message from admin to user
   */
  @Post('admin/send')
  async sendAdminMessage(@Body() body: { userId: string; message: string }) {
    const { userId, message } = body;

    if (!userId || !message || !message.trim()) {
      return {
        success: false,
        message: 'userId and message are required',
      };
    }

    const savedMessage = await this.chatService.saveAdminMessage(
      userId,
      message,
    );

    return {
      success: true,
      data: savedMessage,
    };
  }

  /**
   * DELETE /api/chat/admin/conversation/:userId
   * Delete entire conversation with a user
   */
  @Delete('admin/conversation/:userId')
  async deleteConversation(@Param('userId') userId: string) {
    await this.chatService.deleteConversation(userId);

    return {
      success: true,
      message: 'Conversation deleted successfully',
    };
  }
}
