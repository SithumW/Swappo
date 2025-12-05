import { apiClient } from '../api';
import { User, ApiResponse } from '@/types/api';

class UserService {
  // Get current user profile
  async getCurrentProfile(): Promise<User> {
    const response = await apiClient.get<User>('/users/me');
    return response.data;
  }

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<User> {
    const response = await apiClient.get<User>(`/users/profile/${userId}`);
    return response.data;
  }

  // Update current user profile
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await apiClient.put<User>('/users/profile', data);
    return response.data;
  }

  // Get user's items
  async getUserItems(userId: string, status?: string): Promise<any[]> {
    const params = status ? { status } : {};
    const response = await apiClient.get<any[]>(`/users/${userId}/items`, params);
    return response.data;
  }

  // Get user's trade history
  async getUserTrades(userId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/users/${userId}/trades`);
    return response.data;
  }

  // Get user's reviews
  async getUserReviews(userId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/users/${userId}/reviews`);
    return response.data;
  }

  // Search users
  async searchUsers(params: {
    q?: string;
    latitude?: number;
    longitude?: number;
  }): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/search', params);
    return response.data;
  }

  // Get leaderboard
  async getLeaderboard(): Promise<User[]> {
    const response = await apiClient.get<User[]>('/users/leaderboard');
    return response.data;
  }
}

export const userService = new UserService();
export default userService;
