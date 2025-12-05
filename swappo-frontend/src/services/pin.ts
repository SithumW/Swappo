import { apiClient } from './api';

export interface PinResponse {
  success: boolean;
  pin?: string;
  expiresAt?: string;
  message: string;
}

export interface PinStatus {
  exists: boolean;
  isVerified?: boolean;
  isExpired?: boolean;
  expiresAt?: string;
  userRole?: 'requester' | 'receiver';
  message?: string;
}

export interface PinDetails {
  success: boolean;
  pin?: string;
  expiresAt?: string;
  isVerified?: boolean;
  verifiedAt?: string;
  canEnterPin?: boolean;
}

class PinService {
  // Generate PIN for trade completion (receiver/owner only)
  async generatePin(tradeId: string): Promise<PinResponse> {
    const response = await apiClient.post<PinResponse>(`/pins/generate/${tradeId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to generate PIN');
  }

  // Get PIN details (receiver/owner only)
  async getPinDetails(tradeId: string): Promise<PinDetails> {
    const response = await apiClient.get<PinDetails>(`/pins/${tradeId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get PIN details');
  }

  // Verify PIN (requester only)
  async verifyPin(tradeId: string, pin: string): Promise<{ success: boolean; message: string }> {
    const response = await apiClient.post<{ success: boolean; message: string }>(`/pins/verify/${tradeId}`, { pin });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to verify PIN');
  }

  // Check PIN status
  async getPinStatus(tradeId: string): Promise<PinStatus> {
    console.log(`[PinService] Getting PIN status for trade: ${tradeId}`);
    try {
      const response = await apiClient.get<PinStatus>(`/pins/status/${tradeId}`);
      console.log(`[PinService] PIN status response:`, response);
      
      if (response.success && response.data) {
        console.log(`[PinService] PIN status data:`, response.data);
        return response.data;
      }
      
      console.error(`[PinService] PIN status failed:`, response.message);
      throw new Error(response.message || 'Failed to get PIN status');
    } catch (error: any) {
      console.error(`[PinService] PIN status error:`, error);
      console.error(`[PinService] Error details:`, {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}

export const pinService = new PinService();
export default pinService;
