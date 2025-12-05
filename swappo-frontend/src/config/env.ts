/**
 * Environment configuration utilities
 * Centralized handling of environment variables with fallbacks
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
    endpoint: import.meta.env.VITE_API_ENDPOINT || 'http://localhost:3000/api',
  },
  
  // External Services
  services: {
    avatarApi: import.meta.env.VITE_AVATAR_API_URL || 'https://api.dicebear.com/7.x/avataaars/svg',
  },
  
  // Environment
  app: {
    environment: import.meta.env.VITE_NODE_ENV || 'development',
    isDevelopment: (import.meta.env.VITE_NODE_ENV || 'development') === 'development',
    isProduction: (import.meta.env.VITE_NODE_ENV || 'development') === 'production',
  },
} as const;

// Helper function to construct full image URLs
export const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return '';
  
  // If it's already a full URL (starts with http/https), return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  
  // Combine with backend base URL
  return `${config.api.baseUrl}/${cleanPath}`;
};

// Validation helper to ensure required environment variables are present
export const validateEnv = () => {
  const requiredVars = [
    'VITE_API_BASE_URL',
    'VITE_API_ENDPOINT',
  ];
  
  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing);
    console.warn('Using fallback values. Consider creating a .env file based on .env.example');
  }
};

export default config;
