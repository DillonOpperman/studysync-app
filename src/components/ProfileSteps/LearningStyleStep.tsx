import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { Input } from '../Input';
import { theme } from '../../styles/theme';
import { StudentProfile } from '../../types/Profile';

interface LearningStyleStepProps {
  data: Partial<StudentProfile>;
  onUpdate: (field: keyof StudentProfile, value: any) => void;
}

const STUDY_ENVIRONMENTS = [
  'Quiet Library',
  'Coffee Shop',
  'Study Room',
  'Outdoors',
  'Home/Dorm',
  'Online/Virtual'
];

const STUDY_METHODS = [
  'Flashcards',
  'Group Discussion',
  'Practice Tests',
  'Note Review',
  'Visual Diagrams',
  'Hands-on Practice'
];

const SUBJECTS = [
  'Mathematics',
  'Computer Science',
  'Physics',
  'Chemistry',
  'Biology',
  'Business',
  'Psychology',
  'Engineering',
  'Literature',
  'History'
];

export const LearningStyleStep: React.FC<LearningStyleStepProps> = ({ data, onUpdate }) => {
  
  const toggleSelection = (array: string[], item: string, field: keyof StudentProfile) => {
    const currentArray = array || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    onUpdate(field, newArray);
  };

  return (
    <View style={styles.container}>
      <Input
        label="Learning Style Description"
        placeholder="Describe how you prefer to study (e.g., I learn best with visual aids, group discussions, hands-on practice...)"
        value={data.learningStyle || ''}
        onChangeText={(text) => onUpdate('learningStyle', text)}
        multiline
      />

      <Text style={styles.sectionTitle}>Preferred Study Environments</Text>
      <View style={styles.checkboxGroup}>
        {STUDY_ENVIRONMENTS.map((environment) => (
          <TouchableOpacity
            key={environment}
            style={[
              styles.checkboxItem,
              (data.studyEnvironments || []).includes(environment) && styles.checkboxSelected
            ]}
            onPress={() => toggleSelection(data.studyEnvironments || [], environment, 'studyEnvironments')}
          >
            <Text style={[
              styles.checkboxText,
              (data.studyEnvironments || []).includes(environment) && styles.checkboxTextSelected
            ]}>
              {environment}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Study Methods</Text>
      <View style={styles.checkboxGroup}>
        {STUDY_METHODS.map((method) => (
          <TouchableOpacity
            key={method}
            style={[
              styles.checkboxItem,
              (data.studyMethods || []).includes(method) && styles.checkboxSelected
            ]}
            onPress={() => toggleSelection(data.studyMethods || [], method, 'studyMethods')}
          >
            <Text style={[
              styles.checkboxText,
              (data.studyMethods || []).includes(method) && styles.checkboxTextSelected
            ]}>
              {method}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Current Subjects</Text>
      <View style={styles.checkboxGroup}>
        {SUBJECTS.map((subject) => (
          <TouchableOpacity
            key={subject}
            style={[
              styles.checkboxItem,
              (data.subjects || []).includes(subject) && styles.checkboxSelected
            ]}
            onPress={() => toggleSelection(data.subjects || [], subject, 'subjects')}
          >
            <Text style={[
              styles.checkboxText,
              (data.subjects || []).includes(subject) && styles.checkboxTextSelected
            ]}>
              {subject}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.lg,
  } as TextStyle,
  checkboxGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  checkboxItem: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    minWidth: '45%',
  } as ViewStyle,
  checkboxSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  checkboxText: {
    fontSize: 14,
    color: theme.colors.text,
    textAlign: 'center',
  } as TextStyle,
  checkboxTextSelected: {
    color: theme.colors.white,
    fontWeight: 'bold',
  } as TextStyle,
});