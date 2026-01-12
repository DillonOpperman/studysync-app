// src/services/RealAIService.ts
import { StudentProfile } from '../types/Profile';
import { MatchRecommendation } from '../types/Matching';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class RealAIService {
    // Request to join a group
    static async requestJoinGroup(groupId: string): Promise<any> {
      try {
        const token = await this.getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${this.baseURL}/api/groups/${groupId}/request-join`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          return { success: false, error: errorData.error };
        }

        return await response.json();
      } catch (error) {
        console.error('Error requesting to join group:', error);
        throw error;
      }
    }

    // Get notifications
    static async getNotifications(): Promise<any> {
      try {
        const token = await this.getToken();
        if (!token) {
          return { notifications: [], unreadCount: 0 };
        }

        const response = await fetch(`${this.baseURL}/api/notifications`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          return { notifications: [], unreadCount: 0 };
        }

        return await response.json();
      } catch (error) {
        console.error('Error getting notifications:', error);
        return { notifications: [], unreadCount: 0 };
      }
    }

    // Approve join request (for group leaders)
    static async approveJoinRequest(groupId: string, userId: string): Promise<any> {
      try {
        const token = await this.getToken();
        if (!token) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${this.baseURL}/api/groups/${groupId}/requests/${userId}/approve`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        return await response.json();
      } catch (error) {
        console.error('Error approving join request:', error);
        throw error;
      }
    }
  private static baseURL = 'http://10.0.2.2:5000';
  private static TOKEN_KEY = 'auth_token';

  // Store authentication token
  static async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.error('Error saving token:', error);
    }
  }

  // Get authentication token
  static async getToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  }

  // Clear authentication token (logout)
  static async clearToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  // Get current user's profile
  static async getProfile(): Promise<any> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.baseURL}/api/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }

      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      console.error('Error getting profile:', error);
      return { success: false, error: 'Failed to load profile' };
    }
  }

  // Logout method
  static async logout(): Promise<void> {
    await this.clearToken();
  }

  // Register new user
  static async register(profile: StudentProfile): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          password: profile.password,
          major: profile.major,
          year: profile.year,
          subjects: profile.subjects,
          learning_style: profile.learningStyle,
          preferred_group_size: profile.groupPreferences?.groupSize,
          availability: profile.schedule,
          study_preferences: profile.groupPreferences?.studyGoals,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Registration failed' }));
        console.error('HTTP error! status:', response.status);
        console.error('Backend error:', errorData);
        return {
          success: false,
          status: response.status,
          error: errorData.error || `HTTP error! status: ${response.status}`
        };
      }

      const result = await response.json();
      
      // Store the token
      if (result.token) {
        await this.setToken(result.token);
      }
      
      return { ...result, success: true };
    } catch (error: any) {
      console.error('Error creating profile:', error);
      return {
        success: false,
        error: error.message || 'Network error'
      };
    }
  }

  // Login user
  static async login(email: string, password: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('HTTP error! status:', response.status);
        console.error('Backend error:', errorData);
        return {
          success: false,
          error: errorData.error || 'Login failed'
        };
      }

      const result = await response.json();
      
      // Store the token
      if (result.token) {
        await this.setToken(result.token);
      }
      
      return result;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  // Get recommendations (requires auth)
  static async getRecommendations(): Promise<MatchRecommendation[]> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        console.error('No auth token found');
        return [];
      }

      const response = await fetch(`${this.baseURL}/api/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        const errorText = await response.text();
        console.error('Backend error:', errorText);
        return [];
      }

      const result = await response.json();
      
      if (result.success) {
        return result.recommendations;
      } else {
        console.error('API returned success: false');
        return [];
      }
    } catch (error) {
      console.error('Error getting recommendations:', error);
      return [];
    }
  }

  // Create a group (requires auth)
  static async createGroup(groupData: any): Promise<any> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${this.baseURL}/api/groups/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(groupData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error creating group:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating group:', error);
      throw error;
    }
  }

  // Get user's groups (requires auth)
  static async getUserGroups(): Promise<any[]> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        console.error('No auth token found');
        return [];
      }

      const response = await fetch(`${this.baseURL}/api/groups/mine`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return [];
      }

      const result = await response.json();
      return result.groups || [];
    } catch (error) {
      console.error('Error getting user groups:', error);
      return [];
    }
  }

  // Get group messages (requires auth)
  static async getGroupMessages(groupId: string): Promise<any[]> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        console.error('No auth token found');
        return [];
      }

      const response = await fetch(`${this.baseURL}/api/chat/${groupId}/messages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}`);
        return [];
      }

      const result = await response.json();
      return result.messages || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Send a message (requires auth)
  static async sendMessage(groupId: string, content: string, messageType: string = 'text'): Promise<any> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${this.baseURL}/api/chat/${groupId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          content,
          message_type: messageType
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  // Search groups (requires auth)
  static async searchGroups(query: string): Promise<MatchRecommendation[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.error('No auth token found for search');
        return [];
      }

      const response = await fetch(`${this.baseURL}/api/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.results || [];
    } catch (error) {
      console.error('Error searching groups:', error);
      return [];
    }
  }

  // Search for people
  static async searchPeople(query: string): Promise<any[]> {
    try {
      const token = await this.getToken();
      if (!token) {
        console.error('No auth token found for people search');
        return [];
      }

      const response = await fetch(`${this.baseURL}/api/search/people`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.results || [];
    } catch (error) {
      console.error('Error searching people:', error);
      return [];
    }
  }

  // Get another user's profile
  static async getUserProfile(userId: string): Promise<any> {
    try {
      const token = await this.getToken();
      
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const response = await fetch(`${this.baseURL}/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.error };
      }

      const result = await response.json();
      return { success: true, ...result };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return { success: false, error: 'Failed to load profile' };
    }
  }
}