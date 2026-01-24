// src/screens/DirectMessageScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { RealAIService } from '../services/RealAIService';

interface DirectMessageScreenProps {
  navigation: any;
  route: {
    params: {
      userId: string;
      userName: string;
    };
  };
}

export const DirectMessageScreen: React.FC<DirectMessageScreenProps> = ({ navigation, route }) => {
  const { userId, userName } = route.params;
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMessages();
    loadCurrentUser();
    
    // Refresh messages every 3 seconds
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadCurrentUser = async () => {
    try {
      const profile = await RealAIService.getProfile();
      if (profile && profile.user) {
        setCurrentUserId(profile.user.id);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadMessages = async () => {
    try {
      const msgs = await RealAIService.getDirectMessages(userId);
      setMessages(msgs);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setSending(true);

    try {
      const response = await RealAIService.sendDirectMessage(userId, messageText);
      
      if (response.success) {
        // Reload messages to show the new one
        await loadMessages();
        
        // Scroll to bottom
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        setNewMessage(messageText);
        alert(response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{userName}</Text>
          <Text style={styles.headerSubtitle}>Direct Message</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading messages...</Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptyText}>
                Start the conversation with {userName}!
              </Text>
            </View>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.senderId === currentUserId;
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.messageContainer,
                    isCurrentUser ? styles.messageContainerRight : styles.messageContainerLeft
                  ]}
                >
                  {!isCurrentUser && (
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>
                        {msg.senderName?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <View style={styles.messageContent}>
                    <View
                      style={[
                        styles.messageBubble,
                        isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft
                      ]}
                    >
                      <Text
                        style={[
                          styles.messageText,
                          isCurrentUser && styles.messageTextRight
                        ]}
                      >
                        {msg.content}
                      </Text>
                    </View>
                    <Text style={[
                      styles.messageTime,
                      isCurrentUser && styles.messageTimeRight
                    ]}>
                      {formatTime(msg.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !newMessage.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Text style={styles.sendButtonText}>
              {sending ? '...' : '>'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  flex: {
    flex: 1,
  } as ViewStyle,
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  backButton: {
    fontSize: 28,
    color: theme.colors.white,
    fontWeight: 'bold',
  } as TextStyle,
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.white,
    opacity: 0.8,
  } as TextStyle,
  messagesContainer: {
    flex: 1,
  } as ViewStyle,
  messagesContent: {
    padding: 16,
  } as ViewStyle,
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  } as ViewStyle,
  loadingText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  } as TextStyle,
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  } as ViewStyle,
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  } as TextStyle,
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  } as TextStyle,
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  } as ViewStyle,
  messageContainerLeft: {
    justifyContent: 'flex-start',
  } as ViewStyle,
  messageContainerRight: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  } as ViewStyle,
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  } as ViewStyle,
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  messageContent: {
    maxWidth: '70%',
  } as ViewStyle,
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  } as ViewStyle,
  messageBubbleLeft: {
    backgroundColor: theme.colors.white,
    borderBottomLeftRadius: 4,
  } as ViewStyle,
  messageBubbleRight: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  } as ViewStyle,
  messageText: {
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 20,
  } as TextStyle,
  messageTextRight: {
    color: theme.colors.white,
  } as TextStyle,
  messageTime: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 4,
    marginLeft: 4,
  } as TextStyle,
  messageTimeRight: {
    textAlign: 'right',
    marginRight: 4,
    marginLeft: 0,
  } as TextStyle,
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'flex-end',
  } as ViewStyle,
  input: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: theme.colors.text,
    marginRight: 8,
  } as ViewStyle,
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  } as ViewStyle,
  sendButtonText: {
    fontSize: 18,
  } as TextStyle,
});
