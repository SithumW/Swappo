import { apiClient } from './api';
import { 
  TradeRequest,
  Trade,
  TradeRequestCreate 
} from '@/types/api';

class TradeService {
  // Create trade request
  async createTradeRequest(data: TradeRequestCreate): Promise<TradeRequest> {
    const response = await apiClient.post<TradeRequest>('/trades/request', data);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create trade request');
  }

  // Accept trade request (item owner only)
  async acceptTradeRequest(requestId: string): Promise<Trade> {
    const response = await apiClient.post<Trade>(`/trades/accept/${requestId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to accept trade request');
  }

  // Reject trade request (item owner only)
  async rejectTradeRequest(requestId: string): Promise<void> {
    const response = await apiClient.post(`/trades/reject/${requestId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to reject trade request');
    }
  }

  // Complete trade (either party)
  async completeTrade(tradeId: string): Promise<Trade> {
    const response = await apiClient.post<Trade>(`/trades/complete/${tradeId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to complete trade');
  }

  // Cancel trade (either party)
  async cancelTrade(tradeId: string): Promise<Trade> {
    const response = await apiClient.post<Trade>(`/trades/cancel/${tradeId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to cancel trade');
  }

  // Cancel trade request (for sent requests)
  async cancelTradeRequest(requestId: string): Promise<void> {
    const response = await apiClient.post(`/trades/request/cancel/${requestId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to cancel trade request');
    }
  }

  // Get user's trades
  async getMyTrades(): Promise<Trade[]> {
    const response = await apiClient.get<Trade[]>('/trades/my-trades');
    if (response.success && response.data) {
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn('Unexpected response structure for my trades:', response.data);
      return [];
    }
    throw new Error(response.message || 'Failed to get trades');
  }

  // Get received trade requests
  async getReceivedRequests(): Promise<TradeRequest[]> {
    const response = await apiClient.get<TradeRequest[]>('/trades/requests/received');
    if (response.success && response.data) {
      // Ensure we return an array
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn('Unexpected response structure for received requests:', response.data);
      return [];
    }
    throw new Error(response.message || 'Failed to get received requests');
  }

  // Get sent trade requests (with pagination)
  async getSentRequests(page: number = 1, limit: number = 10): Promise<TradeRequest[]> {
    const response = await apiClient.get<any>('/trades/requests/sent', {
      page,
      limit
    });
    
    if (response.success && response.data) {
      // Check if the response has a paginated structure
      if (response.data.requests && Array.isArray(response.data.requests)) {
        return response.data.requests;
      }
      // If it's already an array, return it directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // If it's neither, return empty array
      console.warn('Unexpected response structure for sent requests:', response.data);
      return [];
    }
    
    throw new Error(response.message || 'Failed to get sent requests');
  }

  // Get completed trades for a user
  async getCompletedTrades(userId?: string): Promise<Trade[]> {
 
    const url = userId ? `/trades/completed/${userId}` : '/trades/completed';
    const response = await apiClient.get<Trade[]>(url);
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        return response.data;
      }
      console.warn('Unexpected response structure for completed trades:', response.data);
      return [];
    }
    throw new Error(response.message || 'Failed to get completed trades');
  }
}

export const tradeService = new TradeService();
export default tradeService;
