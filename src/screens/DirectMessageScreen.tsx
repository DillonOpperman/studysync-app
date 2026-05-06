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
  Image,
  Alert,
  Linking,
  ViewStyle,
  TextStyle,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick, types, isErrorWithCode, errorCodes } from '@react-native-documents/picker';
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
        Alert.alert('Error', response.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(messageText);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const handleMediaPress = () => {
    handleCamera();
  };

  const handleCamera = async () => {
    console.log('camera icon pressed');
    try {
      const result = await launchCamera({ mediaType: 'photo', quality: 0.8, saveToPhotos: false });
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
    setSending(true);
    try {
      console.log('calling uploadFile...');
      const uploadResult = await RealAIService.uploadFile(uri, mimeType, fileName, 'image');
      console.log('uploadFile result:', JSON.stringify(uploadResult));
      if (!uploadResult.success || !uploadResult.url) {
        Alert.alert('Upload failed', uploadResult.error || 'Could not upload image');
        return;
      }
      const response = await RealAIService.sendDirectImageMessage(userId, uploadResult.url);
      if (response.success) {
        await loadMessages();
        setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
      } else {
        Alert.alert('Error', response.error || 'Failed to send image');
      }
    } catch (error) {
      console.error('uploadAndSendImage error:', error);
      Alert.alert('Upload Error', String(error));
    } finally {
      setSending(false);
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
              setSending(true);
              const uploadResult = await RealAIService.uploadFile(result.uri, result.type || 'application/octet-stream', result.name || `file_${Date.now()}`, 'file');
              if (!uploadResult.success || !uploadResult.url) {
                Alert.alert('Upload failed', uploadResult.error || 'Could not upload file');
                setSending(false);
                return;
              }
              const response = await RealAIService.sendDirectFileMessage(
                userId,
                uploadResult.url,
                uploadResult.fileName || result.name || 'file',
                result.type || 'application/octet-stream',
                uploadResult.fileSize || result.size || 0
              );
              if (response.success) {
                await loadMessages();
                setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
              } else {
                Alert.alert('Error', response.error || 'Failed to send file');
              }
            } catch (err) {
              if (isErrorWithCode(err) && err.code === errorCodes.OPERATION_CANCELED) return;
              Alert.alert('Error', 'Could not open file picker');
            } finally {
              setSending(false);
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
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
        <View style={styles.headerSpacer} />
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
                      {msg.messageType === 'image' && msg.imageUrl ? (
                        <Image source={{ uri: msg.imageUrl }} style={styles.messageImage} resizeMode="cover" />
                      ) : msg.messageType === 'file' && msg.fileUrl ? (
                        <TouchableOpacity
                          style={styles.fileCard}
                          onPress={() => Linking.openURL(msg.fileUrl)}
                        >
                          <Text style={styles.fileIcon}>📎</Text>
                          <View style={styles.fileInfo}>
                            <Text style={[styles.fileName, isCurrentUser && styles.fileNameRight]} numberOfLines={1}>
                              {msg.fileName || 'File'}
                            </Text>
                            {msg.fileSize ? (
                              <Text style={styles.fileSize}>{formatFileSize(msg.fileSize)}</Text>
                            ) : null}
                          </View>
                          <Text style={[styles.fileOpen, isCurrentUser && styles.fileOpenRight]}>Open</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text
                          style={[
                            styles.messageText,
                            isCurrentUser && styles.messageTextRight
                          ]}
                        >
                          {msg.content}
                        </Text>
                      )}
                    </View>
                    <Text style={[
                      styles.messageTime,
                      isCurrentUser && styles.messageTimeRight
                    ]}>
                      {formatTime(msg.createdAt || msg.timestamp)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={handleMediaPress}>
            <Text style={styles.iconButtonText}>📷</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleFilePick}>
            <Text style={styles.iconButtonText}>📎</Text>
          </TouchableOpacity>
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
              {sending ? '…' : '›'}
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
  headerSpacer: {
    width: 40,
  } as ViewStyle,
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
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,
  iconButtonText: {
    fontSize: 18,
  } as TextStyle,
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
    fontSize: 22,
    color: theme.colors.white,
    fontWeight: 'bold',
  } as TextStyle,
  messageImage: {
    width: 220,
    height: 180,
    borderRadius: 12,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 4,
  } as ViewStyle,
  fileIcon: {
    fontSize: 22,
    marginRight: 8,
  } as TextStyle,
  fileInfo: {
    flex: 1,
  } as ViewStyle,
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.text,
  } as TextStyle,
  fileNameRight: {
    color: theme.colors.white,
  } as TextStyle,
  fileSize: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    marginTop: 2,
  } as TextStyle,
  fileOpen: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  } as TextStyle,
  fileOpenRight: {
    color: theme.colors.white,
    opacity: 0.85,
  } as TextStyle,
});
