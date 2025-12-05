import { authClient } from '@/lib/auth-client';
import { User } from '@/types/api';
import { config } from '@/config/env';
import { userService } from '@/services/user';

interface AuthRequest {
  email: string;
  password: string;
  name?: string;
}

// Transform Better Auth user to our User type
const transformBetterAuthUser = (betterAuthUser: any): User => {
  return {
    id: betterAuthUser.id,
    name: betterAuthUser.name,
    email: betterAuthUser.email || '',
    image: betterAuthUser.image || undefined,
    latitude: betterAuthUser.latitude || undefined,
    longitude: betterAuthUser.longitude || undefined,
    bio: betterAuthUser.bio || undefined,
    loyalty_points: betterAuthUser.loyalty_points || 0,
    badge: (betterAuthUser.badge as 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'RUBY') || 'BRONZE',
    createdAt: betterAuthUser.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: betterAuthUser.updatedAt?.toISOString() || new Date().toISOString(),
  };
};

class BetterAuthService {
  // Register new user using Better Auth
  async register(data: AuthRequest): Promise<User> {
    try {
      console.log('[BetterAuth] Starting registration process with data:', { 
        email: data.email, 
        name: data.name,
        hasPassword: !!data.password 
      });
      
      // Ensure all required fields are strings and properly formatted
      const registrationData = {
        email: String(data.email).trim(),
        password: String(data.password),
        name: String(data.name || '').trim(),
      };

      // Validate required fields
      if (!registrationData.email || !registrationData.password || !registrationData.name) {
        throw new Error('Email, password, and name are required');
      }

      if (registrationData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      console.log('[BetterAuth] Sending registration request via Better Auth client...');
      
      const response = await authClient.signUp.email(registrationData);
      
      console.log('[BetterAuth] Registration response:', {
        hasData: !!response.data,
        hasUser: !!response.data?.user,
        hasError: !!response.error,
      });
      
      if (response.data?.user) {
        console.log('[BetterAuth] Registration successful:', response.data.user.name);
        
        // After successful Better Auth registration, fetch complete user profile from our API
        try {
          console.log('[BetterAuth] Fetching complete user profile from API after registration...');
          const fullUserProfile = await userService.getMyProfile();
          console.log('[BetterAuth] Full user profile fetched after registration:', fullUserProfile.name, 'Points:', fullUserProfile.loyalty_points);
          
          // Store complete user data locally
          localStorage.setItem('auth_user', JSON.stringify(fullUserProfile));
          return fullUserProfile;
        } catch (profileError) {
          console.warn('[BetterAuth] Failed to fetch complete profile after registration, using Basic Auth data:', profileError);
          // Fallback to transformed Better Auth user if API call fails
          const user = transformBetterAuthUser(response.data.user);
          localStorage.setItem('auth_user', JSON.stringify(user));
          return user;
        }
      }
      
      if (response.error) {
        console.error('[BetterAuth] Registration error details:', response.error);
        let errorMessage = 'Registration failed';
        
        // Handle different error formats from Better Auth
        if (response.error.message) {
          errorMessage = response.error.message;
        } else if (response.error.code) {
          errorMessage = `Registration failed: ${response.error.code}`;
        } else if (response.error.statusText) {
          errorMessage = response.error.statusText;
        }
        
        throw new Error(errorMessage);
      }
      
      throw new Error('Registration failed - no user data received');
    } catch (error: any) {
      console.error('[BetterAuth] Registration exception:', error);
      
      // Handle specific error cases
      if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
        throw new Error('Server returned invalid response. Please try again.');
      }
      
      if (error.message?.includes('duplicate') || error.message?.includes('already exists')) {
        throw new Error('An account with this email already exists');
      }
      
      if (error.message?.includes('validation') || error.message?.includes('invalid')) {
        throw new Error('Please check your input and try again');
      }
      
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user using Better Auth
  async login(data: Omit<AuthRequest, 'name'>): Promise<User> {
    try {
      console.log('[BetterAuth] Starting login process...');
      
      const response = await authClient.signIn.email({
        email: data.email,
        password: data.password,
      });
      
      if (response.data?.user) {
        console.log('[BetterAuth] Login successful:', response.data.user.name);
        
        // After successful Better Auth login, fetch complete user profile from our API
        try {
          console.log('[BetterAuth] Fetching complete user profile from API...');
          const fullUserProfile = await userService.getMyProfile();
          console.log('[BetterAuth] Full user profile fetched:', fullUserProfile.name, 'Points:', fullUserProfile.loyalty_points);
          
          // Store complete user data locally
          localStorage.setItem('auth_user', JSON.stringify(fullUserProfile));
          return fullUserProfile;
        } catch (profileError) {
          console.warn('[BetterAuth] Failed to fetch complete profile, using Basic Auth data:', profileError);
          // Fallback to transformed Better Auth user if API call fails
          const user = transformBetterAuthUser(response.data.user);
          localStorage.setItem('auth_user', JSON.stringify(user));
          return user;
        }
      }
      
      if (response.error) {
        console.error('[BetterAuth] Login error:', response.error);
        throw new Error(response.error.message || 'Invalid email or password');
      }
      
      throw new Error('Login failed - no user data received');
    } catch (error: any) {
      console.error('[BetterAuth] Login exception:', error);
      throw new Error(error.message || 'Login failed');
    }
  }

  // Get current session using Better Auth
  async getCurrentUser(): Promise<User | null> {
    try {
      console.log('[BetterAuth] Checking current session...');
      
      const session = await authClient.getSession();
      
      if (session.data?.user) {
        console.log('[BetterAuth] Session valid for user:', session.data.user.name);
        
        // After validating session, fetch complete user profile from our API
        try {
          console.log('[BetterAuth] Fetching complete user profile from API...');
          const fullUserProfile = await userService.getMyProfile();
          console.log('[BetterAuth] Full user profile fetched:', fullUserProfile.name, 'Points:', fullUserProfile.loyalty_points);
          
          // Update localStorage with fresh user data
          localStorage.setItem('auth_user', JSON.stringify(fullUserProfile));
          return fullUserProfile;
        } catch (profileError) {
          console.warn('[BetterAuth] Failed to fetch complete profile, using Basic Auth data:', profileError);
          // Fallback to transformed Better Auth user if API call fails
          const user = transformBetterAuthUser(session.data.user);
          localStorage.setItem('auth_user', JSON.stringify(user));
          return user;
        }
      }
      
      if (session.error) {
        console.log('[BetterAuth] Session error:', session.error.message);
      } else {
        console.log('[BetterAuth] No active session found');
      }
      
      // Clear localStorage if no valid session
      localStorage.removeItem('auth_user');
      return null;
    } catch (error: any) {
      console.error('[BetterAuth] Session check exception:', error);
      // Clear localStorage on error
      localStorage.removeItem('auth_user');
      return null;
    }
  }

  // Logout using Better Auth
  async logout(): Promise<void> {
    try {
      console.log('[BetterAuth] Starting logout process...');
      
      const response = await authClient.signOut();
      
      if (response.error) {
        console.error('[BetterAuth] Logout error:', response.error);
      } else {
        console.log('[BetterAuth] Logout successful');
      }
    } catch (error: any) {
      console.error('[BetterAuth] Logout exception:', error);
      // Continue with local cleanup even if server logout fails
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_user');
    }
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      console.error('[BetterAuth] Authentication check failed:', error);
      return false;
    }
  }

  // Get user data synchronously from localStorage (for quick access)
  getCurrentUserSync(): User | null {
    try {
      const storedUser = localStorage.getItem('auth_user');
      if (storedUser) {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error('[BetterAuth] Error parsing stored user data:', error);
      return null;
    }
  }

  // Clear local session data
  clearLocalSession(): void {
    localStorage.removeItem('auth_user');
  }

  // Utility method to handle authentication errors
  private handleAuthError(error: any): never {
    let message = 'An authentication error occurred';
    
    if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }
    
    console.error('[BetterAuth] Error:', message);
    throw new Error(message);
  }
}

export const betterAuthService = new BetterAuthService();
export default betterAuthService;
