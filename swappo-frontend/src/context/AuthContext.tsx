import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '@/types/api';
import { betterAuthService } from '@/services/betterAuthService'; // Use Better Auth service
import { toast } from 'sonner';
import { LocationPermissionModal } from '@/components/LocationPermissionModal';
import { getStoredUserLocation, clearUserLocation, hasLocationPermission, getCurrentLocation } from '@/utils/location';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  userLocation: { latitude: number; longitude: number } | null;
  hasLocation: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [hasLocation, setHasLocation] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  
  // Get QueryClient instance to clear cache on logout
  const queryClient = useQueryClient();

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Initialize location state
  useEffect(() => {
    const storedLocation = getStoredUserLocation();
    if (storedLocation) {
      setUserLocation({
        latitude: storedLocation.latitude,
        longitude: storedLocation.longitude,
      });
      setHasLocation(true);
    }
  }, []);

  // Debug authentication state changes
  useEffect(() => {
    console.log('[Auth] State changed:', { 
      user: user?.name || null, 
      isAuthenticated, 
      isLoading 
    });
  }, [user, isAuthenticated, isLoading]);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);
      console.log('[Auth] Starting authentication check...');
      const currentUser = await betterAuthService.getCurrentUser();
      
      if (currentUser) {
        console.log('[Auth] User session restored:', currentUser.name);
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        console.log('[Auth] No valid session found');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[Auth] Failed to initialize auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log('[Auth] Starting login process...');
      
      // Clear all cached data before login to prevent data leakage between users
      await queryClient.clear();
      console.log('[Auth] Cleared query cache before login');
      
      const loggedInUser = await betterAuthService.login({ email, password });
      
      setUser(loggedInUser);
      setIsAuthenticated(true);
      
      console.log('[Auth] Login successful, setting state. User:', loggedInUser.name, 'Authenticated:', true);
      
      // Check if user has location permission, if not, show modal
      if (!hasLocation) {
        setShowLocationModal(true);
      }
      
      toast.success(`Welcome back, ${loggedInUser.name}!`);
      console.log('[Auth] Login process completed successfully');
    } catch (error: any) {
      console.error('[Auth] Login failed:', error);
      const message = error.message || 'Login failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Clear all cached data before registration to ensure clean state
      await queryClient.clear();
      console.log('[Auth] Cleared query cache before registration');
      
      const newUser = await betterAuthService.register({ name, email, password });
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      toast.success(`Welcome to Swappo, ${newUser.name}!`);
      console.log('[Auth] Registration successful:', newUser.name);
    } catch (error: any) {
      console.error('[Auth] Registration failed:', error);
      const message = error.message || 'Registration failed. Please try again.';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await betterAuthService.logout();
      
      // Clear all cached data on logout to prevent data leakage to next user
      await queryClient.clear();
      console.log('[Auth] Cleared query cache after logout');
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast.success('Successfully logged out');
      console.log('[Auth] Logout successful');
    } catch (error: any) {
      console.error('[Auth] Logout error:', error);
      // Force logout locally even if API call fails, but still clear cache
      await queryClient.clear();
      console.log('[Auth] Cleared query cache after logout (with errors)');
      
      setUser(null);
      setIsAuthenticated(false);
      toast.warning('Logged out (with errors)');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await betterAuthService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('[Auth] Failed to refresh user:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const requestLocationPermission = async () => {
    setShowLocationModal(true);
  };

  const handleLocationGranted = (location: { latitude: number; longitude: number }) => {
    setUserLocation(location);
    setHasLocation(true);
    setShowLocationModal(false);
  };

  const handleLocationDenied = () => {
    setShowLocationModal(false);
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    userLocation,
    hasLocation,
    login,
    register,
    logout,
    refreshUser
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
      <LocationPermissionModal 
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationGranted={handleLocationGranted}
        onLocationDenied={handleLocationDenied}
      />
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
