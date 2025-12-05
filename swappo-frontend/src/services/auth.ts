import { apiClient } from './api';
import { AuthRequest, User, BetterAuthResponse } from '@/types/api';

class AuthService {
  // Register new user
  async register(data: AuthRequest): Promise<User> {
    const response = await apiClient.postAuth<BetterAuthResponse>('/auth/sign-up/email', data);
    
    // Better-Auth handles session via cookies automatically
    if (response.user) {
      // Store user data in localStorage for quick access
      apiClient.saveUserData(response.user);
      console.log('[Auth] Registration successful, user data saved');
      return response.user;
    }
    
    throw new Error('Registration failed - no user data received');
  }

  // Login user
  async login(data: Omit<AuthRequest, 'name'>): Promise<User> {
    const response = await apiClient.postAuth<BetterAuthResponse>('/auth/sign-in/email', data);
    
    // Better-Auth handles session via cookies automatically
    if (response.user) {
      // Store user data in localStorage for quick access
      apiClient.saveUserData(response.user);
      console.log('[Auth] Login successful, user data saved');
      return response.user;
    }
    
    throw new Error('Login failed - no user data received');
  }

  // Get current session/user - check server session
  async getCurrentUser(): Promise<User | null> {
    try {
      // First try to get session from server (validates cookie)
      const sessionData = await apiClient.getSession();
      
      if (sessionData && sessionData.user) {
        // Update localStorage with fresh user data
        apiClient.saveUserData(sessionData.user);
        console.log('[Auth] Session validated, user data updated:', sessionData.user.name);
        return sessionData.user;
      }
      
      // If no session, clear localStorage
      apiClient.clearUserData();
      console.log('[Auth] No valid session found');
      return null;
    } catch (error) {
      console.error('[Auth] Error retrieving session:', error);
      // Clear localStorage on error
      apiClient.clearUserData();
      return null;
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/sign-out');
      console.log('[Auth] Server logout successful');
    } catch (error) {
      console.error('[Auth] Server logout error:', error);
      // Even if server logout fails, clear local state
    } finally {
      // Always clear user data from local storage
      apiClient.clearUserData();
      console.log('[Auth] Local user data cleared');
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      // Check if we have a valid session on the server
      const sessionData = await apiClient.getSession();
      return !!(sessionData && sessionData.user);
    } catch (error) {
      return false;
    }
  }

  // Get user data synchronously from localStorage (for quick access)
  getCurrentUserSync(): User | null {
    return apiClient.getUserData();
  }
}

export const authService = new AuthService();
export default authService;
