// src/services/StorageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentProfile } from '../types/Profile';
import { MatchRecommendation } from '../types/Matching';

export class StorageService {
    // Generate a unique user ID
    static async generateUserId(): Promise<string> {
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(7);
      return `user_${timestamp}_${random}`;
    }
  private static readonly KEYS = {
    USER_PROFILE: 'user_profile',
    RECENT_MATCHES: 'recent_matches',
    GROUPS: 'user_groups',
  };

  // Save user profile
  static async saveProfile(profile: StudentProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.USER_PROFILE,
        JSON.stringify(profile)
      );
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  // Get user profile
  static async getProfile(): Promise<StudentProfile | null> {
    try {
      const profileJson = await AsyncStorage.getItem(this.KEYS.USER_PROFILE);
      if (profileJson) {
        return JSON.parse(profileJson);
      }
      return null;
    } catch (error) {
      console.error('Error getting profile:', error);
      return null;
    }
  }

  // Clear user profile (for logout)
  static async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.KEYS.USER_PROFILE);
      await AsyncStorage.removeItem(this.KEYS.RECENT_MATCHES);
      await AsyncStorage.removeItem(this.KEYS.GROUPS);
      console.log('Profile cleared successfully');
    } catch (error) {
      console.error('Error clearing profile:', error);
      throw error;
    }
  }

  // Save recent matches
  static async saveMatches(
    matches: MatchRecommendation[]
  ): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.RECENT_MATCHES,
        JSON.stringify(matches)
      );
    } catch (error) {
      console.error('Error saving matches:', error);
      throw error;
    }
  }

  // Get recent matches
  static async getMatches(): Promise<MatchRecommendation[]> {
    try {
      const matchesJson = await AsyncStorage.getItem(this.KEYS.RECENT_MATCHES);
      if (matchesJson) {
        return JSON.parse(matchesJson);
      }
      return [];
    } catch (error) {
      console.error('Error getting matches:', error);
      return [];
    }
  }

  // Save user groups
  static async saveGroups(groups: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.KEYS.GROUPS,
        JSON.stringify(groups)
      );
    } catch (error) {
      console.error('Error saving groups:', error);
      throw error;
    }
  }

  // Get user groups
  static async getGroups(): Promise<any[]> {
    try {
      const groupsJson = await AsyncStorage.getItem(this.KEYS.GROUPS);
      if (groupsJson) {
        return JSON.parse(groupsJson);
      }
      return [];
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  }
}