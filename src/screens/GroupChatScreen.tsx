// src/screens/GroupChatScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Modal,
  Linking,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
import { theme } from '../styles/theme';
import { ChatStorageService } from '../services/ChatStorageService';
import { StorageService } from '../services/StorageService';
import { RealAIService } from '../services/RealAIService';
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

const REACTION_EMOJIS = ['+1', '<3', ':)', '!', '*', '++'];

const MessageBubble: React.FC<{
  message: ChatMessage;
  isOwnMessage: boolean;
  onReact: (messageId: string, emoji: string) => void;
  onImagePress: (uri: string) => void;
}> = ({ message, isOwnMessage, onReact, onImagePress }) => {
  const [showReactions, setShowReactions] = useState(false);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

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

        {message.type === 'file' && message.fileUrl && (
          <TouchableOpacity
            style={styles.fileCard}
            onPress={() => Linking.openURL(message.fileUrl!)}
          >
            <Text style={styles.fileIcon}>📎</Text>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{message.fileName || 'File'}</Text>
              {message.fileSize ? (
                <Text style={styles.fileSize}>{formatFileSize(message.fileSize)}</Text>
              ) : null}
            </View>
            <Text style={styles.fileOpen}>Open</Text>
          </TouchableOpacity>
        )}
        
        {message.message ? <Text style={styles.messageText}>{message.message}</Text> : null}
        
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
  const [isTyping, _setIsTyping] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUri, setPreviewImageUri] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadChat();
    loadUserInfo();
    
    // Mark as read
    ChatStorageService.markAsRead(group.group.id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    handleCamera();
  };

  const handleCamera = async () => {
    console.log('camera icon pressed');
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: false,
      });
      console.log('launchCamera result:', JSON.stringify(result));
      if (result.didCancel) { console.log('camera cancelled'); return; }
      if (result.errorCode) { console.error('camera error:', result.errorCode, result.errorMessage); Alert.alert('Camera Error', result.errorMessage || result.errorCode || 'Unknown error'); return; }
      const asset = result.assets?.[0];
      if (!asset?.uri) { console.error('no asset uri'); return; }
      await uploadAndSendImage(asset.uri, asset.type || 'image/jpeg', asset.fileName || `photo_${Date.now()}.jpg`);
    } catch (err) {
      console.error('handleCamera threw:', err);
      Alert.alert('Camera Error', String(err));
    }
  };

  const uploadAndSendImage = async (uri: string, mimeType: string, fileName: string) => {
    console.log('uploadAndSendImage called', { uri, mimeType, fileName });
    try {
      console.log('calling uploadFile...');
      const uploadResult = await RealAIService.uploadFile(uri, mimeType, fileName, 'image');
      console.log('uploadFile result:', JSON.stringify(uploadResult));
      if (!uploadResult.success || !uploadResult.url) {
        Alert.alert('Upload failed', uploadResult.error || 'Could not upload image');
        return;
      }

      await RealAIService.sendGroupImageMessage(group.group.id, uploadResult.url);

      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        groupId: group.group.id,
        senderId: currentUserId,
        senderName: currentUserName,
        message: '',
        timestamp: new Date().toISOString(),
        type: 'image',
        imageUri: uploadResult.url,
      };
      await ChatStorageService.sendMessage(group.group.id, newMessage);
      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      console.error('uploadAndSendImage error:', error);
      Alert.alert('Upload Error', String(error));
    }
  };

  const handleFilePick = () => {
    Alert.alert(
      'Attach File',
      'Choose an option',
      [
        {
          text: 'Browse Files',
          onPress: async () => {
            try {
              const [result] = await pick({ type: [types.allFiles] });
              if (!result.uri) return;
              await uploadAndSendFile(result.uri, result.type || 'application/octet-stream', result.name || `file_${Date.now()}`, result.size || 0);
            } catch (err) {
              if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
              Alert.alert('Error', 'Could not open file picker');
            }
          },
        },
        {
          text: 'Photo Gallery',
          onPress: async () => {
            const result = await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });
            if (result.didCancel || result.errorCode) return;
            const asset = result.assets?.[0];
            if (!asset?.uri) return;
            await uploadAndSendImage(asset.uri, asset.type || 'image/jpeg', asset.fileName || `photo_${Date.now()}.jpg`);
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const uploadAndSendFile = async (uri: string, mimeType: string, fileName: string, fileSize: number) => {
    try {
      const uploadResult = await RealAIService.uploadFile(uri, mimeType, fileName, 'file');
      if (!uploadResult.success || !uploadResult.url) {
        Alert.alert('Upload failed', uploadResult.error || 'Could not upload file');
        return;
      }

      await RealAIService.sendGroupFileMessage(group.group.id, uploadResult.url, uploadResult.fileName || fileName, mimeType, uploadResult.fileSize || fileSize);

      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        groupId: group.group.id,
        senderId: currentUserId,
        senderName: currentUserName,
        message: '',
        timestamp: new Date().toISOString(),
        type: 'file',
        fileUrl: uploadResult.url,
        fileName: uploadResult.fileName || fileName,
        fileSize: uploadResult.fileSize || fileSize,
        fileType: mimeType,
      };
      await ChatStorageService.sendMessage(group.group.id, newMessage);
      setMessages(prev => [...prev, newMessage]);
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (error) {
      Alert.alert('Error', 'Failed to send file');
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
              Welcome to the group chat!{' \n'}Start the conversation...
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
          {/* Camera Button */}
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleImagePick}
          >
            <Text style={styles.attachIcon}>📷</Text>
          </TouchableOpacity>

          {/* Attachment / File Button */}
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handleFilePick}
          >
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>

          {/* Message Input */}
          <TextInput
            style={styles.messageInput}
            placeholder="Type a message..."
            placeholderTextColor={theme.colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />

          {/* Send Button */}
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendIcon}>›</Text>
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
            <Text style={styles.closePreviewText}>X</Text>
          </TouchableOpacity>
          <Image source={{ uri: previewImageUri }} style={styles.previewImageFull} resizeMode="contain" />
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
  messageImage: { width: 250, height: 200, borderRadius: theme.borderRadius.md, marginBottom: theme.spacing.xs },
  previewImageFull: { width: '100%', height: '100%' },
  fileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: theme.borderRadius.md, padding: theme.spacing.sm, marginBottom: theme.spacing.xs, maxWidth: 240 } as ViewStyle,
  fileIcon: { fontSize: 24, marginRight: theme.spacing.sm } as TextStyle,
  fileInfo: { flex: 1 } as ViewStyle,
  fileName: { fontSize: 13, fontWeight: '600', color: theme.colors.text } as TextStyle,
  fileSize: { fontSize: 11, color: theme.colors.textSecondary, marginTop: 2 } as TextStyle,
  fileOpen: { fontSize: 12, color: theme.colors.primary, fontWeight: 'bold', marginLeft: theme.spacing.sm } as TextStyle,
  timestamp: { fontSize: 10, color: theme.colors.textSecondary, marginTop: theme.spacing.xs, textAlign: 'right', opacity: 0.7 } as TextStyle,
  reactionsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: theme.spacing.xs, gap: theme.spacing.xs } as ViewStyle,
  reactionBadge: { flexDirection: 'row', backgroundColor: theme.colors.accent, borderRadius: theme.borderRadius.full, paddingHorizontal: theme.spacing.xs, paddingVertical: 2, alignItems: 'center' } as ViewStyle,
  reactionEmoji: { fontSize: 12 } as TextStyle,
  reactionCount: { fontSize: 10, marginLeft: 2, color: theme.colors.text, fontWeight: 'bold' } as TextStyle,
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colors.white,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    position: 'relative',
  } as ViewStyle,
  
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,
  
  attachIcon: {
    fontSize: 20,
  } as TextStyle,
  
  messageInput: {
    flex: 1,
    maxHeight: 100,
    minHeight: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: theme.colors.text,
    borderWidth: 2,
    borderColor: theme.colors.border,
  } as ViewStyle,
  
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  } as ViewStyle,
  
  sendButtonDisabled: {
    backgroundColor: theme.colors.border,
    opacity: 0.5,
  } as ViewStyle,
  
  sendIcon: {
    fontSize: 18,
  } as TextStyle,
  
  attachButtonText: { fontSize: 20 } as TextStyle,
  input: { flex: 1, backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg, paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.sm, fontSize: 14, maxHeight: 100 } as ViewStyle,
  sendButtonText: { fontSize: 20, color: theme.colors.white } as TextStyle,
  reactionModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  reactionPicker: { flexDirection: 'row', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.xl, padding: theme.spacing.md, gap: theme.spacing.sm } as ViewStyle,
  reactionOption: { padding: theme.spacing.sm } as ViewStyle,
  reactionOptionEmoji: { fontSize: 32 } as TextStyle,
  imagePreviewModal: { flex: 1, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center' } as ViewStyle,
  closePreview: { position: 'absolute', top: 40, right: 20, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: theme.borderRadius.full, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' } as ViewStyle,
  closePreviewText: { fontSize: 24, color: 'white' } as TextStyle,
});