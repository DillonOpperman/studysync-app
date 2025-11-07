// src/screens/GroupChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../styles/theme';
import { ChatStorageService } from '../services/ChatStorageService';
import { StorageService } from '../services/StorageService';
import { ChatMessage } from '../types/Chat';
import { JoinedGroup } from '../types/Matching';

interface GroupChatScreenProps {
  navigation: any;
  route: {
    params: {
      group: JoinedGroup;
    };
  };
}

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];

const MessageBubble: React.FC<{
  message: ChatMessage;
  isOwnMessage: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onImagePress: (uri: string) => void;
}> = ({ message, isOwnMessage, onReact, onImagePress }) => {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
      <TouchableOpacity 
        onLongPress={() => setShowReactions(true)}
        style={[styles.messageBubble, isOwnMessage ? styles.ownMessage : styles.otherMessage]}
      >
        {!isOwnMessage && <Text style={styles.senderName}>{message.senderName}</Text>}
        
        {message.type === 'image' && message.imageUri && (
          <TouchableOpacity onPress={() => onImagePress(message.imageUri!)}>
            <Image source={{ uri: message.imageUri }} style={styles.messageImage} />
          </TouchableOpacity>
        )}
        
        {message.message && <Text style={styles.messageText}>{message.message}</Text>}
        
        <Text style={styles.timestamp}>
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>

        {message.reactions && message.reactions.length > 0 && (
          <View style={styles.reactionsContainer}>
            {REACTION_EMOJIS.map(emoji => {
              const count = message.reactions?.filter(r => r.emoji === emoji).length || 0;
              if (count === 0) return null;
              return (
                <View key={emoji} style={styles.reactionBadge}>
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  <Text style={styles.reactionCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        )}
      </TouchableOpacity>

      {showReactions && (
        <Modal transparent visible={showReactions} onRequestClose={() => setShowReactions(false)}>
          <TouchableOpacity 
            style={styles.reactionModalOverlay} 
            activeOpacity={1}
            onPress={() => setShowReactions(false)}
          >
            <View style={styles.reactionPicker}>
              {REACTION_EMOJIS.map(emoji => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionOption}
                  onPress={() => {
                    onReact(message.id, emoji);
                    setShowReactions(false);
                  }}
                >
                  <Text style={styles.reactionOptionEmoji}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

export const GroupChatScreen: React.FC<GroupChatScreenProps> = ({ navigation, route }) => {
  const { group } = route.params;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');
  const [currentUserName, setCurrentUserName] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChat();
    loadUserInfo();
    
    // Mark as read
    ChatStorageService.markAsRead(group.group.id);
  }, []);

  const loadChat = async () => {
    const chat = await ChatStorageService.getGroupChat(group.group.id);
    if (chat) {
      setMessages(chat.messages);
    }
  };

  const loadUserInfo = async () => {
    const profile = await StorageService.getProfile();
    if (profile) {
      setCurrentUserId(profile.id);
      setCurrentUserName(profile.name);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      groupId: group.group.id,
      senderId: currentUserId,
      senderName: currentUserName,
      message: inputText.trim(),
      timestamp: new Date().toISOString(),
      type: 'text'
    };

    try {
      await ChatStorageService.sendMessage(group.group.id, newMessage);
      setMessages([...messages, newMessage]);
      setInputText('');
      
      // Scroll to bottom
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleImagePick = () => {
    Alert.alert(
      'Share Photo',
      'Choose an option',
      [
        {
          text: 'Camera',
          onPress: () => handleImageSelected('camera')
        },
        {
          text: 'Gallery',
          onPress: () => handleImageSelected('gallery')
        },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleImageSelected = async (source: string) => {
    // Simulate image selection (in real app, use react-native-image-picker)
    const mockImageUri = `https://picsum.photos/400/300?random=${Date.now()}`;
    
    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      groupId: group.group.id,
      senderId: currentUserId,
      senderName: currentUserName,
      message: '',
      timestamp: new Date().toISOString(),
      type: 'image',
      imageUri: mockImageUri
    };

    try {
      await ChatStorageService.sendMessage(group.group.id, newMessage);
      setMessages([...messages, newMessage]);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send image');
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await ChatStorageService.addReaction(
        group.group.id,
        messageId,
        currentUserId,
        currentUserName,
        emoji
      );
      loadChat();
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleImagePress = (uri: string) => {
    setPreviewImageUri(uri);
    setShowImagePreview(true);
  };

  const openGroupInfo = () => {
    navigation.navigate('GroupInfo', { group });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.headerInfo} onPress={openGroupInfo}>
          <Text style={styles.headerTitle}>{group.group.title}</Text>
          <Text style={styles.headerSubtitle}>
            {group.group.currentMembers} members • {isTyping ? 'typing...' : 'tap for info'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={openGroupInfo} style={styles.infoButton}>
          <Text style={styles.infoButtonText}>ℹ️</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              👋 Welcome to the group chat!{'\n'}Start the conversation...
            </Text>
          </View>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwnMessage={msg.senderId === currentUserId}
              onReact={handleReaction}
              onImagePress={handleImagePress}
            />
          ))
        )}
      </ScrollView>

      {/* Input */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.attachButton} onPress={handleImagePick}>
            <Text style={styles.attachButtonText}>📎</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />

          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal visible={showImagePreview} transparent onRequestClose={() => setShowImagePreview(false)}>
        <View style={styles.imagePreviewModal}>
          <TouchableOpacity 
            style={styles.closePreview} 
            onPress={() => setShowImagePreview(false)}
          >
            <Text style={styles.closePreviewText}>✕</Text>
          </TouchableOpacity>
          <Image source={{ uri: previewImageUri }} style={styles.previewImage} resizeMode="contain" />
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background } as ViewStyle,
  header: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  backButton: { padding: theme.spacing.sm } as ViewStyle,
  backButtonText: { fontSize: 24, color: theme.colors.white } as TextStyle,
  headerInfo: { flex: 1, paddingHorizontal: theme.spacing.sm } as ViewStyle,
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.white } as TextStyle,
  headerSubtitle: { fontSize: 12, color: theme.colors.white, opacity: 0.8 } as TextStyle,
  infoButton: { padding: theme.spacing.sm } as ViewStyle,
  infoButtonText: { fontSize: 20 } as TextStyle,
  messagesContainer: { flex: 1, backgroundColor: '#f0f0f0' } as ViewStyle,
  messagesContent: { padding: theme.spacing.md } as ViewStyle,
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: theme.spacing.xl * 3 } as ViewStyle,
  emptyStateText: { fontSize: 14, color: theme.colors.textSecondary, textAlign: 'center', lineHeight: 20 } as TextStyle,
  messageContainer: { marginBottom: theme.spacing.md } as ViewStyle,
  ownMessageContainer: { alignItems: 'flex-end' } as ViewStyle,
  messageBubble: { maxWidth: '75%', borderRadius: theme.borderRadius.lg, padding: theme.spacing.md } as ViewStyle,
  ownMessage: { backgroundColor: theme.colors.primary } as ViewStyle,
  otherMessage: { backgroundColor: theme.colors.white, ...theme.shadows.light } as ViewStyle,
  senderName: { fontSize: 12, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.xs } as TextStyle,
  messageText: { fontSize: 14, color: theme.colors.text, lineHeight: 18 } as TextStyle,
  messageImage: { width: 250, height: 200, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.xs } as ViewStyle,
  timestamp: { fontSize: 10, color: theme.colors.textSecondary, marginTop: theme.spacing.xs, textAlign: 'right', opacity: 0.7 } as TextStyle,
  reactionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.xs, gap: theme.spacing.xs } as ViewStyle,
  reactionBadge: { flexDirection: 'row', backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.full, paddingHorizontal: theme.spacing.xs, paddingVertical: 2, alignItems: 'center' } as ViewStyle,
  reactionEmoji: { fontSize: 12 } as TextStyle,
  reactionCount: { fontSize: 10, marginLeft: 2, color: theme.colors.text, fontWeight: 'bold' } as TextStyle,
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, borderTopWidth: 1, borderTopColor: theme.colors.border } as ViewStyle,
  attachButton: { padding: theme.spacing.sm, marginRight: theme.spacing.xs } as ViewStyle,
  attachButtonText: { fontSize: 20 } as TextStyle,
  input: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, fontSize: 14, maxHeight: 100 } as ViewStyle,
  sendButton: { marginLeft: theme.spacing.sm, backgroundColor: theme.colors.primary, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  sendButtonDisabled: { opacity: 0.5 } as ViewStyle,
  sendButtonText: { fontSize: 20, color: theme.colors.white } as TextStyle,
  reactionModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  reactionPicker: { flexDirection: 'row', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.xl, padding: theme.spacing.md, gap: theme.spacing.sm } as ViewStyle,
  reactionOption: { padding: theme.spacing.sm } as ViewStyle,
  reactionOptionEmoji: { fontSize: 32 } as TextStyle,
  imagePreviewModal: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  closePreview: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: theme.borderRadius.full, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  closePreviewText: { fontSize: 24, color: 'white' } as TextStyle,
  previewImage: { width: '100%', height: '100%' } as ViewStyle,
});