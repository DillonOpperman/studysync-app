import { StudentProfile } from '../types/Profile';
import { MatchRecommendation } from './MockMatchingService';

export class RealAIService {
  // Change this to your deployed backend URL, or keep localhost for testing
  private static baseURL = 'http://10.0.2.2:5000'; // Change to deployed URL later

  static async createProfile(profile: StudentProfile): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/api/student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error creating profile:', error);
      return { 
        success: false, 
        message: 'Unable to connect to AI service. Please check your connection.' 
      };
    }
  }

  static async getRecommendations(profile: StudentProfile): Promise<MatchRecommendation[]> {
    try {
      const response = await fetch(`${this.baseURL}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_data: profile
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        return result.recommendations;
      } else {
        throw new Error(result.error || 'Failed to get recommendations');
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      // Return empty array instead of throwing, so app doesn't crash
      return [];
    }
  }

  static async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}