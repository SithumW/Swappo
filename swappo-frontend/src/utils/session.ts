// Utility functions for Better Auth session management

export const SESSION_KEY = 'auth_user';

// Save user data to localStorage (for quick access)
export const saveUserSession = (user: any): void => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    console.log('[Session] User data saved to localStorage');
  } catch (error) {
    console.error('[Session] Failed to save user data:', error);
  }
};

// Get user data from localStorage
export const getUserSession = (): any | null => {
  try {
    const userData = localStorage.getItem(SESSION_KEY);
    if (userData) {
      return JSON.parse(userData);
    }
    return null;
  } catch (error) {
    console.error('[Session] Failed to parse user data:', error);
    return null;
  }
};

// Clear user data from localStorage
export const clearUserSession = (): void => {
  try {
    localStorage.removeItem(SESSION_KEY);
    console.log('[Session] User data cleared from localStorage');
  } catch (error) {
    console.error('[Session] Failed to clear user data:', error);
  }
};

// Check if user session exists in localStorage
export const hasUserSession = (): boolean => {
  return localStorage.getItem(SESSION_KEY) !== null;
};

// Update user data in localStorage
export const updateUserSession = (updates: Partial<any>): void => {
  const currentUser = getUserSession();
  if (currentUser) {
    const updatedUser = { ...currentUser, ...updates };
    saveUserSession(updatedUser);
  }
};

// Utility for debugging session state
export const debugSessionState = (): void => {
  console.log('[Session Debug] Current session:', {
    hasSession: hasUserSession(),
    userData: getUserSession(),
    cookiesEnabled: navigator.cookieEnabled,
    localStorage: typeof Storage !== 'undefined'
  });
};
