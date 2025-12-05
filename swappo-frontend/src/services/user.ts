import { apiClient } from './api';
import { 
  User, 
  UserProfile, 
  Item, 
  ItemsQuery,
  SearchQuery,
  RatingStats 
} from '@/types/api';

class UserService {
  // Get user profile by ID
  async getUserProfile(userId: string): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>(`/users/profile/${userId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get user profile');
  }

  // Get current user profile
  async getMyProfile(): Promise<UserProfile> {
    const response = await apiClient.get<UserProfile>('/users/me');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get profile');
  }

  // Update current user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/users/profile', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update profile');
  }

  // Get user's items
  async getUserItems(userId: string, status?: string): Promise<Item[]> {
    const params: any = {};
    if (status && status !== 'ALL') {
      params.status = status;
    }
    
    const response = await apiClient.get<Item[]>(`/users/${userId}/items`, params);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get user items');
  }

  // Get user's trade history
  async getUserTrades(userId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/users/${userId}/trades`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get user trades');
  }

  // Get user's reviews
  async getUserReviews(userId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/users/${userId}/reviews`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get user reviews');
  }

  // Search users
  async searchUsers(query: SearchQuery): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/search', query);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to search users');
  }

  // Get leaderboard
  async getLeaderboard(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/leaderboard');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get leaderboard');
  }

  // Get user rating statistics
  async getUserRatingStats(userId: string): Promise<RatingStats> {
    const response = await apiClient.get<RatingStats>(`/ratings/user/${userId}/stats`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get rating stats');
  }
}

export const userService = new UserService();
export default userService;
