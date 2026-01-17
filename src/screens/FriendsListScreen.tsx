// src/screens/FriendsListScreen.tsx
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

interface FriendsListScreenProps {
  navigation: any;
}

export const FriendsListScreen: React.FC<FriendsListScreenProps> = ({ navigation }) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      setLoading(true);
      const friendsList = await RealAIService.getFriends();
      setFriends(friendsList || []);
    } catch (error) {
      console.error('Error loading friends:', error);
      Alert.alert('Error', 'Failed to load friends list');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFriends();
    setRefreshing(false);
  };

  const handleFriendPress = (friend: any) => {
    navigation.navigate('UserProfile', { 
      userId: friend.id,
      userName: friend.name 
    });
  };

  const handleMessageFriend = (friend: any) => {
    navigation.navigate('DirectMessage', {
      userId: friend.id,
      userName: friend.name
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Friends</Text>
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
              <Text style={styles.loadingText}>Loading friends...</Text>
            </View>
          ) : friends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>No Friends</Text>
              <Text style={styles.emptyTitle}>Start Connecting</Text>
              <Text style={styles.emptyText}>
                Start connecting with other students! Search for people in the Search tab and send friend requests.
              </Text>
              <TouchableOpacity 
                style={styles.searchButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.searchButtonText}>Go Back</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.friendCount}>
                {friends.length} {friends.length === 1 ? 'Friend' : 'Friends'}
              </Text>
              
              {friends.map((friend) => (
                <View key={friend.id} style={styles.friendCard}>
                  <TouchableOpacity 
                    style={styles.friendInfo}
                    onPress={() => handleFriendPress(friend)}
                  >
                    <View style={styles.friendAvatar}>
                      <Text style={styles.friendInitial}>
                        {friend.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    
                    <View style={styles.friendDetails}>
                      <Text style={styles.friendName}>{friend.name}</Text>
                      <Text style={styles.friendMeta}>
                        {friend.major} • {friend.year}
                      </Text>
                      {friend.email && (
                        <Text style={styles.friendEmail}>{friend.email}</Text>
                      )}
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.messageButton}
                    onPress={() => handleMessageFriend(friend)}
                  >
                    <Text style={styles.messageButtonText}>Message</Text>
                  </TouchableOpacity>
                </View>
              ))}
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
    marginBottom: 24,
  } as TextStyle,
  searchButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  } as ViewStyle,
  searchButtonText: {
    color: theme.colors.white,
    fontSize: 16,
    fontWeight: '600',
  } as TextStyle,
  friendCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: 16,
  } as TextStyle,
  friendCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  } as ViewStyle,
  friendInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  } as ViewStyle,
  friendAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  } as ViewStyle,
  friendInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  friendDetails: {
    flex: 1,
  } as ViewStyle,
  friendName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: 4,
  } as TextStyle,
  friendMeta: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 2,
  } as TextStyle,
  friendEmail: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  } as TextStyle,
  messageButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 12,
  } as ViewStyle,
  messageButtonText: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: '600',
  } as TextStyle,
});
