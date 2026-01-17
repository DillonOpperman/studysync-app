import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../styles/theme';
import { RealAIService } from '../services/RealAIService';

interface NotificationBellProps {
  navigation: any;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ navigation }) => {
  const [unreadCount, setUnreadCount] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      loadUnreadCount();
      
      // Refresh every 10 seconds while screen is focused
      const interval = setInterval(loadUnreadCount, 10000);
      
      return () => clearInterval(interval);
    }, [])
  );

  const loadUnreadCount = async () => {
    try {
      const result = await RealAIService.getNotifications();
      if (result.success) {
        const unread = result.notifications.filter((n: any) => !n.read).length;
        setUnreadCount(unread);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  return (
    <TouchableOpacity
      style={styles.bellContainer}
      onPress={() => {
        navigation.navigate('Notifications');
        loadUnreadCount(); // Refresh when opened
      }}
    >
      <Text style={styles.bellIcon}>Inbox</Text>
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bellContainer: {
    position: 'relative',
    padding: 8,
  } as ViewStyle,
  bellIcon: {
    fontSize: 16,
    color: theme.colors.white,
    fontWeight: 'bold',
  } as TextStyle,
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  } as ViewStyle,
  badgeText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  } as TextStyle,
});
