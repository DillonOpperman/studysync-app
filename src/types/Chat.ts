// src/types/Chat.ts

export interface ChatMessage {
  id: string;
  groupId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'announcement';
  imageUri?: string;
  fileName?: string;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  userId: string;
  userName: string;
  emoji: string;
}

export interface GroupChat {
  groupId: string;
  messages: ChatMessage[];
  lastRead?: string;
  unreadCount: number;
}

export interface StudySession {
  id: string;
  groupId: string;
  title: string;
  scheduledTime: string;
  location: string;
  attendees: string[];
  createdBy: string;
}