// src/screens/MyGroupsScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  ViewStyle,
  TextStyle,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../styles/theme';
import { RealAIService } from '../services/RealAIService';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

interface MyGroupsScreenProps {
  navigation: any;
  route?: any;
}

const GroupCard: React.FC<{
  group: any;
  onPress: () => void;
}> = ({ group, onPress }) => (
  <TouchableOpacity style={styles.groupCard} onPress={onPress}>
    <View style={styles.groupHeader}>
      <Text style={styles.groupTitle}>{group.title}</Text>
      <View style={[
        styles.statusBadge,
        group.status === 'active' && styles.statusActive,
        group.status === 'pending' && styles.statusPending,
      ]}>
        <Text style={styles.statusText}>
          {group.status === 'active' ? 'Active' : 'Pending'}
        </Text>
      </View>
    </View>

    <Text style={styles.groupSubject}>{group.subject}</Text>
    
    <View style={styles.groupInfo}>
      <Text style={styles.groupInfoText}>
        Members: {group.currentMembers}/{group.maxMembers}
      </Text>
      <Text style={styles.groupInfoText}>
        Schedule: {group.schedule || 'Flexible'}
      </Text>
      <Text style={styles.groupInfoText}>
        Location: {group.location || 'TBD'}
      </Text>
      <Text style={styles.groupInfoText}>
        Led by {group.leaderName}
      </Text>
    </View>

    {group.role === 'leader' && (
      <View style={styles.leaderBadge}>
        <Text style={styles.leaderBadgeText}>You're the leader</Text>
      </View>
    )}
  </TouchableOpacity>
);

export const MyGroupsScreen: React.FC<MyGroupsScreenProps> = ({ navigation, route }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Create group form state
  const [groupTitle, setGroupTitle] = useState('');
  const [groupSubject, setGroupSubject] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupSchedule, setGroupSchedule] = useState('');
  const [groupLocation, setGroupLocation] = useState('');
  const [maxMembers, setMaxMembers] = useState('6');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadGroups();

    // Check if we should open create modal (coming from Dashboard)
    if (route?.params?.openCreateModal) {
      setShowCreateModal(true);
    }
  }, [route?.params?.openCreateModal]);

  const loadGroups = async () => {
    try {
      setLoading(true);
      // CORRECT: Load from backend API
      const myGroups = await RealAIService.getUserGroups();
      console.log('Loaded groups from backend:', myGroups);
      setGroups(myGroups || []);
    } catch (error) {
      console.error('Error loading groups:', error);
      Alert.alert('Error', 'Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadGroups();
    setRefreshing(false);
  };

  const handleCreateGroup = async () => {
    if (!groupTitle.trim() || !groupSubject.trim()) {
      Alert.alert('Missing fields', 'Please fill in at least the group title and subject');
      return;
    }

    try {
      setCreating(true);
      
      // CORRECT: Create group via backend API
      const response = await RealAIService.createGroup({
        title: groupTitle,
        subject: groupSubject,
        description: groupDescription,
        schedule: groupSchedule || 'Flexible',
        location: groupLocation || 'TBD',
        maxMembers: parseInt(maxMembers, 10) || 6,
      });

      if (response.success) {
        // Reset form
        setGroupTitle('');
        setGroupSubject('');
        setGroupDescription('');
        setGroupSchedule('');
        setGroupLocation('');
        setMaxMembers('6');
        setShowCreateModal(false);

        // Reload groups from backend
        await loadGroups();

        Alert.alert(
          'Group created!', 
          `Group "${groupTitle}" created successfully!\n\nYou are now the group leader. Other students can find and join your group through search.`
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Alert.alert('Create failed', 'Failed to create group. Please try again.');
    } finally {
      setCreating(false);
    }
  };

  const handleGroupPress = (group: any) => {
    if (group.status === 'active') {
      // Navigate to group chat
      navigation.navigate('GroupChat', { 
        group: {
          group: {
            id: group.id,
            title: group.title,
            subject: group.subject,
            description: group.description,
            schedule: group.schedule,
            location: group.location,
            maxMembers: group.maxMembers,
            currentMembers: group.currentMembers,
            members: [],
            leader: group.leaderName,
            createdAt: group.createdAt,
            meetingTimes: []
          },
          joinedAt: group.joinedAt,
          status: group.status
        }
      });
    } else {
      Alert.alert(
        group.title,
        `Status: Pending approval\n\nYour request to join this group is waiting for approval from the group leader.`
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Groups</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
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
              <Text style={styles.loadingText}>Loading your groups...</Text>
            </View>
          ) : groups.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                Active Groups ({groups.filter(g => g.status === 'active').length})
              </Text>
              {groups
                .filter(g => g.status === 'active')
                .map((group, index) => (
                  <GroupCard
                    key={group.id || index}
                    group={group}
                    onPress={() => handleGroupPress(group)}
                  />
                ))}

              {groups.some(g => g.status === 'pending') && (
                <>
                  <Text style={styles.sectionTitle}>
                    Pending ({groups.filter(g => g.status === 'pending').length})
                  </Text>
                  {groups
                    .filter(g => g.status === 'pending')
                    .map((group, index) => (
                      <GroupCard
                        key={group.id || index}
                        group={group}
                        onPress={() => handleGroupPress(group)}
                      />
                    ))}
                </>
              )}
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>No Groups Yet</Text>
              <Text style={styles.emptyText}>
                You haven't joined any study groups yet.{'\n'}
                Start by creating your own or search for existing groups!
              </Text>
              <Button
                title="Search Groups"
                onPress={() => navigation.navigate('Search')}
                style={styles.searchButton}
              />
              <Button
                title="Create Group"
                variant="secondary"
                onPress={() => setShowCreateModal(true)}
                style={styles.searchButton}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Create Study Group</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Input
              label="Group Title *"
              placeholder="e.g., Math 220 Study Group"
              value={groupTitle}
              onChangeText={setGroupTitle}
              editable={!creating}
            />

            <Input
              label="Subject *"
              placeholder="e.g., Calculus, Computer Science"
              value={groupSubject}
              onChangeText={setGroupSubject}
              editable={!creating}
            />

            <Input
              label="Description"
              placeholder="What will this group focus on?"
              value={groupDescription}
              onChangeText={setGroupDescription}
              multiline
              editable={!creating}
            />

            <Input
              label="Schedule"
              placeholder="e.g., Mon/Wed 6-8 PM"
              value={groupSchedule}
              onChangeText={setGroupSchedule}
              editable={!creating}
            />

            <Input
              label="Location"
              placeholder="e.g., Library Study Room B"
              value={groupLocation}
              onChangeText={setGroupLocation}
              editable={!creating}
            />

            <Input
              label="Max Members"
              placeholder="6"
              value={maxMembers}
              onChangeText={setMaxMembers}
              keyboardType="number-pad"
              editable={!creating}
            />

            <View style={styles.modalButtons}>
              <Button
                title={creating ? "Creating..." : "Create Group"}
                onPress={handleCreateGroup}
                style={styles.createFullButton}
                disabled={creating}
              />
            </View>

            <View style={styles.tipsBox}>
              <Text style={styles.tipsTitle}>Tips for Success</Text>
              <Text style={styles.tipsText}>
                • Be specific about the group's focus{'\n'}
                • Set clear meeting times and locations{'\n'}
                • Keep groups small (4-6 members) for best results{'\n'}
                • Update members about schedule changes
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  header: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as ViewStyle,
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.white,
  } as TextStyle,
  createButton: {
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  } as ViewStyle,
  createButtonText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  } as TextStyle,
  scrollView: {
    flex: 1,
  } as ViewStyle,
  content: {
    padding: theme.spacing.lg,
  } as ViewStyle,
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  } as ViewStyle,
  loadingText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  } as TextStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  } as TextStyle,
  groupCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.light,
  } as ViewStyle,
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  } as ViewStyle,
  groupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  } as TextStyle,
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  } as ViewStyle,
  statusActive: {
    backgroundColor: theme.colors.success,
  } as ViewStyle,
  statusPending: {
    backgroundColor: theme.colors.secondary,
  } as ViewStyle,
  statusText: {
    color: theme.colors.white,
    fontSize: 11,
    fontWeight: 'bold',
  } as TextStyle,
  groupSubject: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  groupInfo: {
    marginBottom: theme.spacing.sm,
  } as ViewStyle,
  groupInfoText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 18,
  } as TextStyle,
  leaderBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  } as ViewStyle,
  leaderBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000',
  } as TextStyle,
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  } as ViewStyle,
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  emptyText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  } as TextStyle,
  searchButton: {
    marginTop: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
  } as ViewStyle,
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.white,
  } as ViewStyle,
  headerSpacer: {
    width: 60,
  } as ViewStyle,
  cancelText: {
    fontSize: 16,
    color: theme.colors.danger,
  } as TextStyle,
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
  } as TextStyle,
  modalContent: {
    flex: 1,
    padding: theme.spacing.lg,
  } as ViewStyle,
  modalButtons: {
    marginTop: theme.spacing.lg,
  } as ViewStyle,
  createFullButton: {
    width: '100%',
  } as ViewStyle,
  tipsBox: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  } as ViewStyle,
  tipsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  tipsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  } as TextStyle,
});