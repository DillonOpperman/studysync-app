// src/services/ChatStorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage, GroupChat, StudySession } from '../types/Chat';

export class ChatStorageService {
  private static readonly KEYS = {
    CHATS: 'group_chats',
    SESSIONS: 'study_sessions'
  };

  // Get all chats
  static async getAllChats(): Promise<{ [groupId: string]: GroupChat }> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.CHATS);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting chats:', error);
      return {};
    }
  }

  // Get chat for specific group
  static async getGroupChat(groupId: string): Promise<GroupChat | null> {
    try {
      const allChats = await this.getAllChats();
      return allChats[groupId] || null;
    } catch (error) {
      console.error('Error getting group chat:', error);
      return null;
    }
  }

  // Send message
  static async sendMessage(groupId: string, message: ChatMessage): Promise<void> {
    try {
      const allChats = await this.getAllChats();
      
      if (!allChats[groupId]) {
        allChats[groupId] = {
          groupId,
          messages: [],
          unreadCount: 0
        };
      }
      
      allChats[groupId].messages.push(message);
      await AsyncStorage.setItem(this.KEYS.CHATS, JSON.stringify(allChats));
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Add reaction to message
  static async addReaction(groupId: string, messageId: string, userId: string, userName: string, emoji: string): Promise<void> {
    try {
      const allChats = await this.getAllChats();
      const chat = allChats[groupId];
      
      if (!chat) return;
      
      const message = chat.messages.find(m => m.id === messageId);
      if (!message) return;
      
      if (!message.reactions) message.reactions = [];
      
      // Toggle reaction if already exists
      const existingReaction = message.reactions.find(r => r.userId === userId && r.emoji === emoji);
      if (existingReaction) {
        message.reactions = message.reactions.filter(r => !(r.userId === userId && r.emoji === emoji));
      } else {
        message.reactions.push({ userId, userName, emoji });
      }
      
      await AsyncStorage.setItem(this.KEYS.CHATS, JSON.stringify(allChats));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  }

  // Mark chat as read
  static async markAsRead(groupId: string): Promise<void> {
    try {
      const allChats = await this.getAllChats();
      if (allChats[groupId]) {
        allChats[groupId].unreadCount = 0;
        allChats[groupId].lastRead = new Date().toISOString();
        await AsyncStorage.setItem(this.KEYS.CHATS, JSON.stringify(allChats));
      }
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }

  // Study Sessions
  static async getAllSessions(): Promise<StudySession[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.SESSIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting sessions:', error);
      return [];
    }
  }

  static async createSession(session: StudySession): Promise<void> {
    try {
      const sessions = await this.getAllSessions();
      sessions.push(session);
      await AsyncStorage.setItem(this.KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  static async getGroupSessions(groupId: string): Promise<StudySession[]> {
    try {
      const allSessions = await this.getAllSessions();
      return allSessions.filter(s => s.groupId === groupId);
    } catch (error) {
      console.error('Error getting group sessions:', error);
      return [];
    }
  }
}