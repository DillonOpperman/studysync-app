import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ViewStyle,
  TextStyle,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { RealAIService } from '../services/RealAIService';

interface NotificationsScreenProps {
  navigation: any;
}

const NotificationCard: React.FC<{
  notification: any;
  onAccept?: () => void;
  onReject?: () => void;
  onPress?: () => void;
}> = ({ notification, onAccept, onReject, onPress }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'friend_request': return 'Friend';
      case 'friend_request_accepted': return 'Accepted';
      case 'join_request': return 'Request';
      case 'request_approved': return 'Approved';
      case 'direct_message': return 'Message';
      default: return 'Alert';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.notificationCard, !notification.read && styles.unreadCard]}
      onPress={onPress}
    >
      <View style={styles.notificationIcon}>
        <Text style={styles.iconText}>{getIcon(notification.type)}</Text>
      </View>
      
      <View style={styles.notificationContent}>
        <Text style={styles.notificationTitle}>{notification.title}</Text>
        <Text style={styles.notificationMessage}>{notification.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(notification.createdAt).toLocaleString()}
        </Text>

        {/* Action buttons for friend requests */}
        {notification.type === 'friend_request' && onAccept && onReject && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <Text style={styles.rejectButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Action buttons for join requests */}
        {notification.type === 'join_request' && onAccept && onReject && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
              <Text style={styles.acceptButtonText}>Approve</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.rejectButton} onPress={onReject}>
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {!notification.read && <View style={styles.unreadDot} />}
    </TouchableOpacity>
  );
};

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const result = await RealAIService.getNotifications();
      
      if (result.success) {
        setNotifications(result.notifications || []);
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleAcceptFriendRequest = async (notification: any) => {
    try {
      // Try multiple possible locations for the request ID
      const requestId = notification.data?.requestId || notification.data?.id || notification.id;
      if (!requestId) {
        Alert.alert('Error', 'Invalid friend request - missing request ID');
        console.log('Notification data:', JSON.stringify(notification));
        return;
      }

      const response = await RealAIService.acceptFriendRequest(requestId);
      
      if (response.success) {
        Alert.alert('Success!', 'Friend request accepted');
        await loadNotifications();
      } else {
        Alert.alert('Error', response.error || 'Failed to accept request');
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  const handleRejectFriendRequest = async (notification: any) => {
    try {
      // Try multiple possible locations for the request ID
      const requestId = notification.data?.requestId || notification.data?.id || notification.id;
      if (!requestId) {
        Alert.alert('Error', 'Invalid friend request - missing request ID');
        console.log('Notification data:', JSON.stringify(notification));
        return;
      }

      const response = await RealAIService.rejectFriendRequest(requestId);
      
      if (response.success) {
        Alert.alert('Request Rejected', 'Friend request has been rejected');
        await loadNotifications();
      } else {
        Alert.alert('Error', response.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      Alert.alert('Error', 'Failed to reject friend request');
    }
  };

  const handleApproveJoinRequest = async (notification: any) => {
    try {
      const { groupId, requesterId } = notification.data || {};
      
      if (!groupId || !requesterId) {
        Alert.alert('Error', 'Invalid join request');
        return;
      }

      const response = await RealAIService.approveJoinRequest(groupId, requesterId);
      
      if (response.success) {
        Alert.alert('Success!', response.message || 'Join request approved');
        await loadNotifications();
      } else {
        Alert.alert('Error', response.error || 'Failed to approve request');
      }
    } catch (error) {
      console.error('Error approving join request:', error);
      Alert.alert('Error', 'Failed to approve join request');
    }
  };

  const handleRejectJoinRequest = async (notification: any) => {
    try {
      const { groupId, requesterId } = notification.data || {};
      
      if (!groupId || !requesterId) {
        Alert.alert('Error', 'Invalid join request');
        return;
      }

      const response = await RealAIService.rejectJoinRequest(groupId, requesterId);
      
      if (response.success) {
        Alert.alert('Request Rejected', response.message || 'Join request has been rejected');
        await loadNotifications();
      } else {
        Alert.alert('Error', response.error || 'Failed to reject request');
      }
    } catch (error) {
      console.error('Error rejecting join request:', error);
      Alert.alert('Error', 'Failed to reject join request');
    }
  };

  const handleNotificationPress = async (notification: any) => {
    // Mark as read
    try {
      await RealAIService.markNotificationRead(notification.id);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }

    // Handle navigation based on type
    if (notification.type === 'direct_message') {
      const { senderId, senderName } = notification.data || {};
      if (senderId && senderName) {
        navigation.navigate('DirectMessage', { userId: senderId, userName: senderName });
      }
    } else if (notification.type === 'request_approved') {
      const { groupId } = notification.data || {};
      if (groupId) {
        navigation.navigate('Main', {
          screen: 'MyGroups'
        });
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.content}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>No Notifications</Text>
              <Text style={styles.emptyTitle}>All Caught Up</Text>
              <Text style={styles.emptyText}>
                You're all caught up! You'll see notifications here when:
                {'\n'}• Someone sends you a friend request
                {'\n'}• Someone requests to join your group
                {'\n'}• You receive a direct message
                {'\n'}• Your requests are accepted
              </Text>
            </View>
          ) : (
            <>
              {notifications.filter(n => !n.read).length > 0 && (
                <Text style={styles.sectionTitle}>
                  New ({notifications.filter(n => !n.read).length})
                </Text>
              )}
              
              {notifications
                .filter(n => !n.read)
                .map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onPress={() => handleNotificationPress(notification)}
                    onAccept={
                      notification.type === 'friend_request'
                        ? () => handleAcceptFriendRequest(notification)
                        : notification.type === 'join_request'
                        ? () => handleApproveJoinRequest(notification)
                        : undefined
                    }
                    onReject={
                      notification.type === 'friend_request'
                        ? () => handleRejectFriendRequest(notification)
                        : notification.type === 'join_request'
                        ? () => handleRejectJoinRequest(notification)
                        : undefined
                    }
                  />
                ))}

              {notifications.filter(n => n.read).length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>
                    Earlier ({notifications.filter(n => n.read).length})
                  </Text>
                  {notifications
                    .filter(n => n.read)
                    .map((notification) => (
                      <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onPress={() => handleNotificationPress(notification)}
                      />
                    ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: 'bold',
  } as TextStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  content: {
    padding: 16,
  } as ViewStyle,
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  } as ViewStyle,
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  } as TextStyle,
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  } as ViewStyle,
  emptyIcon: {
    fontSize: 24,
    marginBottom: 16,
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
  } as TextStyle,
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 8,
  } as TextStyle,
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  } as TextStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 12,
    marginTop: 8,
  } as TextStyle,
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    position: 'relative',
  } as ViewStyle,
  unreadCard: {
    borderColor: theme.colors.primary,
    backgroundColor: '#F0F7FF',
  } as ViewStyle,
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  iconText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  notificationContent: {
    flex: 1,
  } as ViewStyle,
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  } as TextStyle,
  notificationMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 6,
    lineHeight: 20,
  } as TextStyle,
  notificationTime: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  } as TextStyle,
  unreadDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  } as ViewStyle,
  acceptButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  } as ViewStyle,
  acceptButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
  rejectButton: {
    flex: 1,
    backgroundColor: theme.colors.border,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  } as ViewStyle,
  rejectButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
});
