// Test file to check API connectivity
import { apiClient } from '@/services/api';

export const testApiConnection = async () => {
  try {
    console.log('Testing API connection...');
    
    // Test rating endpoint
    const response = await apiClient.get('/ratings/user/test123');
    console.log('Rating API response:', response);
    
    // Test rating stats endpoint
    const statsResponse = await apiClient.get('/ratings/user/test123/stats');
    console.log('Rating stats API response:', statsResponse);
    
    return {
      success: true,
      message: 'API connection successful',
      data: { ratings: response, stats: statsResponse }
    };
  } catch (error: any) {
    console.error('API connection failed:', error);
    return {
      success: false,
      message: error.message || 'API connection failed',
      error: error.response?.data || error
    };
  }
};

// You can call this from your component to test the connection
// testApiConnection().then(result => console.log('Test result:', result));
