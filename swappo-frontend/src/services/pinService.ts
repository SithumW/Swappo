// services/pinService.ts
import api from './api';

export interface TradePin {
  id: string;
  pinCode: string;
  expiresAt: string;
  generatedAt: string;
  trade?: {
    requested_item: { title: string };
    offered_item: { title: string };
  };
}

export interface PinStatus {
  success: boolean;
  userRole: 'owner' | 'requester';
  tradeStatus: string;
  pinExists: boolean;
  pinStatus: {
    pinCode?: string; // Only visible to owner
    isVerified: boolean;
    isExpired: boolean;
    expiresAt: string;
    generatedAt: string;
    verifiedAt?: string;
  } | null;
}

export interface PinResponse {
  success: boolean;
  message?: string;
  pin?: TradePin;
  trade?: any;
  error?: string;
}

class PinService {
  // Generate PIN for trade completion (owner/receiver calls this)
  async generatePin(tradeId: string): Promise<PinResponse> {
    try {
      const response = await api.post(`/pins/generate/${tradeId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to generate PIN'
      };
    }
  }

  // Verify PIN for trade completion (requester calls this)
  async verifyPin(tradeId: string, pinCode: string): Promise<PinResponse> {
    try {
      const response = await api.post(`/pins/verify/${tradeId}`, { pinCode });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to verify PIN'
      };
    }
  }

  // Get PIN status for a trade
  async getPinStatus(tradeId: string): Promise<PinStatus | null> {
    try {
      const response = await api.get(`/pins/status/${tradeId}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get PIN status:', error);
      return null;
    }
  }

  // Format PIN code for display (add spaces for readability)
  formatPinCode(pinCode: string): string {
    return pinCode.replace(/(\d{3})(\d{3})/, '$1 $2');
  }

  // Calculate time remaining for PIN expiry
  getTimeRemaining(expiresAt: string): string {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Expired';
    }

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }

  // Check if PIN is about to expire (less than 1 hour)
  isExpiringSoon(expiresAt: string): boolean {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diffMs = expires.getTime() - now.getTime();
    const oneHour = 60 * 60 * 1000;
    
    return diffMs > 0 && diffMs <= oneHour;
  }
}

export default new PinService();
