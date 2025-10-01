import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../styles/theme';
import { RootStackNavigationProp, RootStackRouteProp } from '../navigation/AppNavigator';

interface GroupDetailsScreenProps {
  navigation: RootStackNavigationProp<'GroupDetails'>;
  route: RootStackRouteProp<'GroupDetails'>;
}

export const GroupDetailsScreen: React.FC<GroupDetailsScreenProps> = ({ navigation, route }) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Math 220 Study Group</Text>
        <Text style={styles.subtitle}>Calculus • Evening Sessions</Text>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>4</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>95%</Text>
          <Text style={styles.statLabel}>Your Match</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Sessions/Week</Text>
        </View>
      </View>

      {/* Details */}
      <ScrollView contentContainerStyle={styles.details}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <Text style={styles.sectionText}>
            • Mondays: 6-8 PM{"\n"}
            • Wednesdays: 6-8 PM{"\n"}
            • Location: Library Study Room B
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Members</Text>
          <View style={styles.tags}>
            {["Sarah M. (Leader)", "Mike R.", "Lisa K.", "Tom B."].map((member) => (
              <Text key={member} style={styles.tag}>{member}</Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Study Focus</Text>
          <Text style={styles.sectionText}>
            Preparing for midterm exam. Focuses on problem-solving and concept review.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Requirements</Text>
          <Text style={styles.sectionText}>
            • Must be enrolled in Math 220{"\n"}
            • Attend sessions regularly{"\n"}
            • Bring textbook and notes
          </Text>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.joinBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.joinText}>Request to Join Group</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.msgBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.msgText}>Message Group Leader</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  } as ViewStyle,
  header: {
    backgroundColor: theme.colors.primary,
    padding: 20,
    alignItems: 'center',
  } as ViewStyle,
  title: { 
    color: 'white', 
    fontSize: 18, 
    fontWeight: 'bold' 
  } as TextStyle,
  subtitle: { 
    color: 'white', 
    opacity: 0.9, 
    fontSize: 12 
  } as TextStyle,
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    padding: 15,
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,
  statItem: { 
    alignItems: 'center' 
  } as ViewStyle,
  statNumber: { 
    color: theme.colors.primary, 
    fontWeight: 'bold', 
    fontSize: 18 
  } as TextStyle,
  statLabel: { 
    color: theme.colors.textSecondary, 
    fontSize: 11 
  } as TextStyle,
  details: { 
    padding: 20 
  } as ViewStyle,
  section: { 
    marginBottom: 20 
  } as ViewStyle,
  sectionTitle: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 8,
    paddingBottom: 4,
  } as TextStyle,
  sectionText: { 
    fontSize: 13, 
    color: theme.colors.textSecondary 
  } as TextStyle,
  tags: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    marginTop: 10 
  } as ViewStyle,
  tag: {
    backgroundColor: theme.colors.accent,
    color: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    fontSize: 12,
  } as TextStyle,
  actions: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderColor: theme.colors.border 
  } as ViewStyle,
  joinBtn: {
    backgroundColor: theme.colors.success,
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  } as ViewStyle,
  joinText: { 
    color: 'white', 
    fontWeight: 'bold', 
    textAlign: 'center' 
  } as TextStyle,
  msgBtn: {
    backgroundColor: theme.colors.info,
    padding: 12,
    borderRadius: 8,
  } as ViewStyle,
  msgText: { 
    color: 'white', 
    textAlign: 'center' 
  } as TextStyle,
});