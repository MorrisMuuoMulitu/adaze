import { prisma } from "@/lib/prisma";
import { notificationService } from "./notificationService";

export const chatService = {
  isServer: typeof window === 'undefined',

  /**
   * Get or create a conversation between a buyer and a trader
   */
  async getOrCreateConversation(buyerId: string, traderId: string, productId?: string, orderId?: string) {
    if (!this.isServer) {
      const res = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ traderId, productId, orderId }),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      
      // Check if conversation already exists
      let conversation = await prisma.conversation.findFirst({
        where: {
          buyerId,
          traderId,
          productId: productId || null,
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: {
            buyerId,
            traderId,
            productId,
            orderId,
          },
        });
      }

      return conversation;
    } catch (error) {
      console.error('Error in getOrCreateConversation:', error);
      throw error;
    }
  },

  /**
   * Get all conversations for a user (either as buyer or trader)
   */
  async getUserConversations(userId: string) {
    if (!this.isServer) {
      const res = await fetch('/api/chat/conversations');
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      return await prisma.conversation.findMany({
        where: {
          OR: [
            { buyerId: userId },
            { traderId: userId },
          ],
        },
        include: {
          buyer: {
            select: { id: true, name: true, image: true },
          },
          trader: {
            select: { id: true, name: true, image: true },
          },
          product: {
            select: { id: true, name: true, price: true, imageUrl: true },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
    } catch (error) {
      console.error('Error fetching user conversations:', error);
      throw error;
    }
  },

  /**
   * Get messages for a conversation
   */
  async getConversationMessages(conversationId: string, limit = 50) {
    if (!this.isServer) {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`);
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      return await prisma.message.findMany({
        where: { conversationId },
        include: {
          sender: {
            select: { id: true, name: true, image: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        take: limit,
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Send a message in a conversation
   */
  async sendMessage(conversationId: string, senderId: string, content: string, attachments: string[] = []) {
    if (!this.isServer) {
      const res = await fetch(`/api/chat/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, attachments }),
      });
      return res.json();
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      
      const [message, conversation] = await prisma.$transaction([
        // 1. Create message
        prisma.message.create({
          data: {
            conversationId,
            senderId,
            content,
            attachments,
          },
          include: {
            sender: {
              select: { id: true, name: true },
            },
          },
        }),
        // 2. Update conversation updatedAt
        prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
          include: {
            buyer: { select: { id: true, name: true } },
            trader: { select: { id: true, name: true } },
          },
        }),
      ]);

      // Notify recipient
      const recipientId = conversation.buyerId === senderId ? conversation.traderId : conversation.buyerId;
      await notificationService.createMessageNotification(
        recipientId,
        message.sender.name || 'User',
        conversationId,
        content
      );

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  /**
   * Mark messages in a conversation as read
   */
  async markAsRead(conversationId: string, userId: string) {
    if (!this.isServer) {
      await fetch(`/api/chat/conversations/${conversationId}/read`, { method: 'POST' });
      return;
    }

    try {
      const { prisma } = await import('@/lib/prisma');
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: userId },
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  },
};
