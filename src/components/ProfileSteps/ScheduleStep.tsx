import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../styles/theme';
import { StudentProfile } from '../../types/Profile';

interface ScheduleStepProps {
  data: Partial<StudentProfile>;
  onUpdate: (field: keyof StudentProfile, value: any) => void;
  onUpdateNested: (parentField: keyof StudentProfile, childField: string, value: any) => void;
}

const TIME_SLOTS = [
  'Morning (8-12 PM)',
  'Afternoon (12-5 PM)',
  'Evening (5-9 PM)',
  'Night (9-12 AM)'
];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const PERFORMANCE_LEVELS = [
  { level: 1, label: 'Struggling', description: 'Need lots of help' },
  { level: 2, label: 'Below Average', description: 'Need some help' },
  { level: 3, label: 'Average', description: 'Doing okay' },
  { level: 4, label: 'Above Average', description: 'Doing well' },
  { level: 5, label: 'Excellent', description: 'Can help others' }
];

export const ScheduleStep: React.FC<ScheduleStepProps> = ({ data, onUpdate, onUpdateNested }) => {
  
  const toggleTimeSlot = (day: string, timeSlot: string) => {
    const currentSchedule = data.schedule || {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
      Friday: [], Saturday: [], Sunday: []
    };
    
    const currentDaySlots = currentSchedule[day as keyof typeof currentSchedule] || [];
    const newDaySlots = currentDaySlots.includes(timeSlot)
      ? currentDaySlots.filter(slot => slot !== timeSlot)
      : [...currentDaySlots, timeSlot];
    
    const newSchedule = {
      ...currentSchedule,
      [day]: newDaySlots
    };
    
    onUpdate('schedule', newSchedule);
  };

  const isTimeSlotSelected = (day: string, timeSlot: string): boolean => {
    const currentSchedule = data.schedule || {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [],
      Friday: [], Saturday: [], Sunday: []
    };
    return (currentSchedule[day as keyof typeof currentSchedule] || []).includes(timeSlot);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Available Study Times</Text>
      <Text style={styles.instructionText}>Select when you're typically available to study</Text>
      
      {DAYS.map((day) => (
        <View key={day} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day}</Text>
          <View style={styles.timeSlotContainer}>
            {TIME_SLOTS.map((timeSlot) => (
              <TouchableOpacity
                key={`${day}-${timeSlot}`}
                style={[
                  styles.timeSlot,
                  isTimeSlotSelected(day, timeSlot) && styles.timeSlotSelected
                ]}
                onPress={() => toggleTimeSlot(day, timeSlot)}
              >
                <Text style={[
                  styles.timeSlotText,
                  isTimeSlotSelected(day, timeSlot) && styles.timeSlotTextSelected
                ]}>
                  {timeSlot}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>Academic Performance Level</Text>
      <Text style={styles.instructionText}>How would you rate your overall academic performance?</Text>
      
      <View style={styles.performanceContainer}>
        {PERFORMANCE_LEVELS.map((item) => (
          <TouchableOpacity
            key={item.level}
            style={[
              styles.performanceItem,
              data.performanceLevel === item.level && styles.performanceSelected
            ]}
            onPress={() => onUpdate('performanceLevel', item.level)}
          >
            <Text style={[
              styles.performanceLabel,
              data.performanceLevel === item.level && styles.performanceTextSelected
            ]}>
              {item.label}
            </Text>
            <Text style={[
              styles.performanceDescription,
              data.performanceLevel === item.level && styles.performanceTextSelected
            ]}>
              {item.description}
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
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.lg,
  } as TextStyle,
  instructionText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  } as TextStyle,
  dayContainer: {
    marginBottom: theme.spacing.md,
  } as ViewStyle,
  dayTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  } as TextStyle,
  timeSlotContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  } as ViewStyle,
  timeSlot: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
    minWidth: '22%',
  } as ViewStyle,
  timeSlotSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  timeSlotText: {
    fontSize: 12,
    color: theme.colors.text,
    textAlign: 'center',
  } as TextStyle,
  timeSlotTextSelected: {
    color: theme.colors.white,
    fontWeight: 'bold',
  } as TextStyle,
  performanceContainer: {
    gap: theme.spacing.sm,
  } as ViewStyle,
  performanceItem: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  } as ViewStyle,
  performanceSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  } as ViewStyle,
  performanceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  } as TextStyle,
  performanceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  } as TextStyle,
  performanceTextSelected: {
    color: theme.colors.white,
  } as TextStyle,
});