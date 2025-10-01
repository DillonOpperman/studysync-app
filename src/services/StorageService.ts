import AsyncStorage from '@react-native-async-storage/async-storage';
import { StudentProfile } from '../types/Profile';
import { MatchRecommendation } from './MockMatchingService';

export class StorageService {
  private static readonly KEYS = {
    USER_PROFILE: 'user_profile',
    RECENT_MATCHES: 'recent_matches',
    USER_ID: 'user_id',
    ONBOARDING_COMPLETED: 'onboarding_completed'
  };

  // Profile Management
  static async saveProfile(profile: StudentProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(this.KEYS.USER_PROFILE, JSON.stringify(profile));
      await AsyncStorage.setItem(this.KEYS.USER_ID, profile.id);
      await AsyncStorage.setItem(this.KEYS.ONBOARDING_COMPLETED, 'true');
      console.log('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  }

  static async getProfile(): Promise<StudentProfile | null> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving profile:', error);
      return null;
    }
  }

  static async updateProfile(updates: Partial<StudentProfile>): Promise<void> {
    try {
      const currentProfile = await this.getProfile();
      if (currentProfile) {
        const updatedProfile = { ...currentProfile, ...updates };
        await this.saveProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // User ID Management
  static async getUserId(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.KEYS.USER_ID);
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }

  static async generateUserId(): Promise<string> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await AsyncStorage.setItem(this.KEYS.USER_ID, userId);
    return userId;
  }

  // Matches Management
  static async saveMatches(matches: MatchRecommendation[]): Promise<void> {
    try {
      const matchData = {
        matches,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(this.KEYS.RECENT_MATCHES, JSON.stringify(matchData));
      console.log(`Saved ${matches.length} matches`);
    } catch (error) {
      console.error('Error saving matches:', error);
    }
  }

  static async getMatches(): Promise<MatchRecommendation[]> {
    try {
      const data = await AsyncStorage.getItem(this.KEYS.RECENT_MATCHES);
      if (data) {
        const parsed = JSON.parse(data);
        // Check if matches are fresh (less than 1 hour old)
        const isRecent = (Date.now() - parsed.timestamp) < 3600000; // 1 hour
        return isRecent ? parsed.matches : [];
      }
      return [];
    } catch (error) {
      console.error('Error retrieving matches:', error);
      return [];
    }
  }

  // Onboarding Status
  static async isOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(this.KEYS.ONBOARDING_COMPLETED);
      return completed === 'true';
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }

  static async clearOnboarding(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.KEYS.ONBOARDING_COMPLETED);
    } catch (error) {
      console.error('Error clearing onboarding:', error);
    }
  }

  // Utility Methods
  static async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(this.KEYS));
      console.log('All user data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }

  static async getStorageInfo(): Promise<{[key: string]: any}> {
    try {
      const keys = Object.values(this.KEYS);
      const items = await AsyncStorage.multiGet(keys);
      const info: {[key: string]: any} = {};
      
      items.forEach(([key, value]) => {
        info[key] = value ? JSON.parse(value) : null;
      });
      
      return info;
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {};
    }
  }
}