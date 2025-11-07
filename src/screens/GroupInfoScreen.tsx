// src/screens/GroupInfoScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../styles/theme';
import { JoinedGroup } from '../types/Matching';
import { ChatStorageService } from '../services/ChatStorageService';
import { StudySession } from '../types/Chat';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { StorageService } from '../services/StorageService';

interface GroupInfoScreenProps {
  navigation: any;
  route: {
    params: {
      group: JoinedGroup;
    };
  };
}

export const GroupInfoScreen: React.FC<GroupInfoScreenProps> = ({ navigation, route }) => {
  const { group } = route.params;
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionLocation, setSessionLocation] = useState('');
  const [currentUserId, setCurrentUserId] = useState('');

  useEffect(() => {
    loadSessions();
    loadUserId();
  }, []);

  const loadSessions = async () => {
    const groupSessions = await ChatStorageService.getGroupSessions(group.group.id);
    setSessions(groupSessions);
  };

  const loadUserId = async () => {
    const profile = await StorageService.getProfile();
    if (profile) setCurrentUserId(profile.id);
  };

  const createSession = async () => {
    if (!sessionTitle || !sessionTime || !sessionLocation) {
      Alert.alert('Missing Info', 'Please fill in all session details');
      return;
    }

    const newSession: StudySession = {
      id: `session_${Date.now()}`,
      groupId: group.group.id,
      title: sessionTitle,
      scheduledTime: sessionTime,
      location: sessionLocation,
      attendees: [currentUserId],
      createdBy: currentUserId
    };

    try {
      await ChatStorageService.createSession(newSession);
      
      // Also post announcement to chat
      const announcement = {
        id: `msg_${Date.now()}`,
        groupId: group.group.id,
        senderId: 'system',
        senderName: 'System',
        message: `📅 New study session: ${sessionTitle}\n⏰ ${sessionTime}\n📍 ${sessionLocation}`,
        timestamp: new Date().toISOString(),
        type: 'announcement' as const
      };
      
      await ChatStorageService.sendMessage(group.group.id, announcement);
      
      setSessionTitle('');
      setSessionTime('');
      setSessionLocation('');
      setShowSessionModal(false);
      loadSessions();
      
      Alert.alert('Success', 'Study session created!');
    } catch (error) {
      Alert.alert('Error', 'Failed to create session');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Group Info</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Group Details */}
        <View style={styles.section}>
          <View style={styles.groupIcon}>
            <Text style={styles.groupIconText}>{group.group.title.charAt(0)}</Text>
          </View>
          <Text style={styles.groupTitle}>{group.group.title}</Text>
          <Text style={styles.groupSubject}>{group.group.subject}</Text>
          <Text style={styles.groupDescription}>{group.group.description || 'No description'}</Text>
        </View>

        {/* Group Details */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Schedule:</Text>
              <Text style={styles.infoValue}>{group.group.schedule}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{group.group.location}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Members:</Text>
              <Text style={styles.infoValue}>{group.group.currentMembers}/{group.group.maxMembers}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Leader:</Text>
              <Text style={styles.infoValue}>{group.group.leader}</Text>
            </View>
          </View>
        </View>

        {/* Members */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Members ({group.group.members.length})</Text>
          <View style={styles.membersContainer}>
            {group.group.members.map((member, index) => (
              <View key={index} style={styles.memberCard}>
                <View style={styles.memberAvatar}>
                  <Text style={styles.memberAvatarText}>{member.name.charAt(0)}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberMajor}>{member.major}</Text>
                  {member.role === 'leader' && (
                    <Text style={styles.leaderBadge}>👑 Leader</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Upcoming Sessions */}
        <View style={styles.infoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
            <TouchableOpacity onPress={() => setShowSessionModal(true)}>
              <Text style={styles.addButton}>+ New</Text>
            </TouchableOpacity>
          </View>
          
          {sessions.length === 0 ? (
            <Text style={styles.noSessions}>No scheduled sessions yet</Text>
          ) : (
            sessions.map((session) => (
              <View key={session.id} style={styles.sessionCard}>
                <Text style={styles.sessionTitle}>📚 {session.title}</Text>
                <Text style={styles.sessionTime}>⏰ {session.scheduledTime}</Text>
                <Text style={styles.sessionLocation}>📍 {session.location}</Text>
                <Text style={styles.sessionAttendees}>
                  {session.attendees.length} attending
                </Text>
              </View>
            ))
          )}
        </View>

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Button 
            title="Leave Group" 
            variant="danger"
            onPress={() => {
              Alert.alert(
                'Leave Group',
                'Are you sure you want to leave this group?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { 
                    text: 'Leave', 
                    style: 'destructive',
                    onPress: () => {
                      // TODO: Implement leave group
                      navigation.navigate('MyGroups');
                    }
                  }
                ]
              );
            }}
          />
        </View>
      </ScrollView>

      {/* Create Session Modal */}
      <Modal
        visible={showSessionModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowSessionModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowSessionModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Schedule Session</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <Input
              label="Session Title"
              placeholder="e.g., Midterm Review, Chapter 5 Discussion"
              value={sessionTitle}
              onChangeText={setSessionTitle}
            />
            
            <Input
              label="Date & Time"
              placeholder="e.g., Monday, Nov 10 at 6:00 PM"
              value={sessionTime}
              onChangeText={setSessionTime}
            />
            
            <Input
              label="Location"
              placeholder="e.g., Library Room 205, Zoom link"
              value={sessionLocation}
              onChangeText={setSessionLocation}
            />

            <Button
              title="Create Session"
              onPress={createSession}
              style={styles.createButton}
            />
          </ScrollView>
        </SafeAreaView>
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
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  } as ViewStyle,
  backButton: { padding: theme.spacing.sm } as ViewStyle,
  backButtonText: { fontSize: 24, color: theme.colors.white } as TextStyle,
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.white } as TextStyle,
  content: { flex: 1 } as ViewStyle,
  section: { alignItems: 'center', paddingVertical: theme.spacing.xl, backgroundColor: theme.colors.white, marginBottom: theme.spacing.md } as ViewStyle,
  groupIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: theme.spacing.md } as ViewStyle,
  groupIconText: { fontSize: 32, fontWeight: 'bold', color: theme.colors.white } as TextStyle,
  groupTitle: { fontSize: 20, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.xs } as TextStyle,
  groupSubject: { fontSize: 14, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm } as TextStyle,
  groupDescription: { fontSize: 13, color: theme.colors.text, textAlign: 'center', paddingHorizontal: theme.spacing.lg } as TextStyle,
  infoSection: { paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.lg } as ViewStyle,
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm } as ViewStyle,
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.sm } as TextStyle,
  addButton: { fontSize: 14, color: theme.colors.primary, fontWeight: 'bold' } as TextStyle,
  infoCard: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.lg, padding: theme.spacing.md, ...theme.shadows.light } as ViewStyle,
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: theme.spacing.sm } as ViewStyle,
  infoLabel: { fontSize: 14, color: theme.colors.textSecondary } as TextStyle,
  infoValue: { fontSize: 14, color: theme.colors.text, fontWeight: '600' } as TextStyle,
  membersContainer: { gap: theme.spacing.sm } as ViewStyle,
  memberCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, ...theme.shadows.light } as ViewStyle,
  memberAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md } as ViewStyle,
  memberAvatarText: { fontSize: 16, fontWeight: 'bold', color: theme.colors.white } as TextStyle,
  memberInfo: { flex: 1 } as ViewStyle,
  memberName: { fontSize: 14, fontWeight: 'bold', color: theme.colors.text } as TextStyle,
  memberMajor: { fontSize: 12, color: theme.colors.textSecondary } as TextStyle,
  leaderBadge: { fontSize: 11, color: theme.colors.secondary, marginTop: 2 } as TextStyle,
  noSessions: { fontSize: 13, color: theme.colors.textSecondary, textAlign: 'center', paddingVertical: theme.spacing.lg } as TextStyle,
  sessionCard: { backgroundColor: theme.colors.white, borderRadius: theme.borderRadius.md, padding: theme.spacing.md, marginBottom: theme.spacing.sm, ...theme.shadows.light } as ViewStyle,
  sessionTitle: { fontSize: 14, fontWeight: 'bold', color: theme.colors.primary, marginBottom: theme.spacing.xs } as TextStyle,
  sessionTime: { fontSize: 13, color: theme.colors.text, marginBottom: 2 } as TextStyle,
  sessionLocation: { fontSize: 13, color: theme.colors.text, marginBottom: theme.spacing.xs } as TextStyle,
  sessionAttendees: { fontSize: 12, color: theme.colors.textSecondary } as TextStyle,
  actionsSection: { padding: theme.spacing.lg, marginBottom: theme.spacing.xl } as ViewStyle,
  modalContainer: { flex: 1, backgroundColor: theme.colors.background } as ViewStyle,
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border, backgroundColor: theme.colors.white } as ViewStyle,
  cancelText: { fontSize: 16, color: theme.colors.danger } as TextStyle,
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.primary } as TextStyle,
  modalContent: { flex: 1, padding: theme.spacing.lg } as ViewStyle,
  createButton: { marginTop: theme.spacing.md } as ViewStyle,
});