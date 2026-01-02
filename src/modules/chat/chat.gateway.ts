import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import * as jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: [process.env.CORS_ORIGIN || 'http://localhost:3000'],
    credentials: true,
  },
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private userSocketMap = new Map<string, string>();
  private adminSocketMap = new Map<string, string>();

  constructor(private readonly chatService: ChatService) {}

  afterInit(server: Server) {
    console.log('[WebSocket] Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        console.error('[Socket] No token provided');
        client.disconnect();
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      const userId = decoded.userId || decoded.sub || decoded.id;

      if (!userId) {
        console.error('[Socket] Invalid token payload');
        client.disconnect();
        return;
      }

      client.userId = userId;
      client.userRole = decoded.role || 'user';

      this.userSocketMap.set(userId, client.id);
      client.join(`user_${userId}`);

      if (client.userRole === 'admin') {
        this.adminSocketMap.set(userId, client.id);
        client.join('admin_room');
        console.log(`[Socket] Admin connected: ${userId}`);
      } else {
        console.log(`[Socket] User connected: ${userId}`);
      }
    } catch (error) {
      console.error('[Socket] Authentication error:', error.message);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.userSocketMap.delete(client.userId);

      if (client.userRole === 'admin') {
        this.adminSocketMap.delete(client.userId);
      }

      console.log(`[Socket] User disconnected: ${client.userId}`);
    }
  }

  @SubscribeMessage('chat:send_message')
  async handleUserMessage(
    @MessageBody() data: { message: string; tempId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { message, tempId } = data;

      if (!message || !message.trim()) {
        client.emit('chat:error', { message: 'Message cannot be empty' });
        return;
      }

      if (!client.userId) {
        client.emit('chat:error', { message: 'Unauthorized' });
        return;
      }

      const savedMessage = await this.chatService.saveUserMessage(
        client.userId,
        message.trim(),
      );

      client.emit('chat:message_sent', {
        message: savedMessage,
        tempId,
      });

      this.server.to('admin_room').emit('chat:new_user_message', {
        message: savedMessage,
        userId: client.userId,
      });

      console.log(
        `[Chat] Message from user ${client.userId}: ${message.substring(0, 50)}`,
      );
    } catch (error) {
      console.error('[Chat] Error sending message:', error);
      client.emit('chat:error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('chat:admin_send_message')
  async handleAdminMessage(
    @MessageBody()
    data: { message: string; targetUserId: string; tempId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { message, targetUserId, tempId } = data;

      if (client.userRole !== 'admin') {
        client.emit('chat:error', { message: 'Unauthorized' });
        return;
      }

      if (!message || !message.trim() || !targetUserId) {
        client.emit('chat:error', { message: 'Invalid data' });
        return;
      }

      const savedMessage = await this.chatService.saveAdminMessage(
        targetUserId,
        message.trim(),
      );

      this.server.to(`user_${targetUserId}`).emit('chat:new_message', {
        message: savedMessage,
      });

      client.emit('chat:message_sent', {
        message: savedMessage,
        tempId,
      });

      console.log(
        `[Chat] Admin message to user ${targetUserId}: ${message.substring(0, 50)}`,
      );
    } catch (error) {
      console.error('[Chat] Error sending admin message:', error);
      client.emit('chat:error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('chat:typing')
  handleTyping(
    @MessageBody() data: { isTyping: boolean; targetUserId?: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    const { isTyping, targetUserId } = data;

    if (client.userRole === 'admin' && targetUserId) {
      this.server.to(`user_${targetUserId}`).emit('chat:admin_typing', {
        isTyping,
      });
    } else {
      this.server.to('admin_room').emit('chat:user_typing', {
        userId: client.userId,
        isTyping,
      });
    }
  }

  @SubscribeMessage('chat:mark_read')
  async handleMarkRead(
    @MessageBody() data: { messageIds: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const { messageIds } = data;

      if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
        await this.chatService.markMessagesAsRead(messageIds);
        client.emit('chat:marked_read', { messageIds });
      }
    } catch (error) {
      console.error('[Chat] Error marking messages as read:', error);
    }
  }
}
