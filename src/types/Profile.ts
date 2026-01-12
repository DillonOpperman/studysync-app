export interface StudentProfile {
  // Basic info (existing)
  id: string;
  name: string;
  email: string;
  university: string;
  major: string;
  year: string;
  password?: string;
  
  // New AI matching fields
  learningStyle: string;
  studyEnvironments: string[];
  studyMethods: string[];
  schedule: WeeklySchedule;
  subjects: string[];
  performanceLevel: number;
  groupPreferences: GroupPreferences;
}

export interface WeeklySchedule {
  Monday: string[];
  Tuesday: string[];
  Wednesday: string[];
  Thursday: string[];
  Friday: string[];
  Saturday: string[];
  Sunday: string[];
}

export interface GroupPreferences {
  groupSize: number;
  sessionDuration: number;
  studyGoals: string[];
}

// Step-specific data interfaces
export interface BasicInfoData {
  name: string;
  email: string;
  university: string;
  major: string;
  year: string;
}

export interface LearningStyleData {
  learningStyle: string;
  studyEnvironments: string[];
  studyMethods: string[];
  subjects: string[];
}

export interface ScheduleData {
  schedule: WeeklySchedule;
  performanceLevel: number;
}

export interface PreferencesData {
  groupPreferences: GroupPreferences;
}