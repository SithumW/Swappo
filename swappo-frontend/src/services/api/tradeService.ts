import { apiClient } from '../api';
import { ApiResponse } from '@/types/api';

// Trade types based on your API documentation
interface TradeRequest {
  id: string;
  requested_item_id: string;
  offered_item_id: string;
  requester_id: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  requested_at: string;
  requested_item: {
    id: string;
    title: string;
    description: string;
    images: any[];
    user: { id: string; name: string; image: string };
  };
  offered_item: {
    id: string;
    title: string;
    description: string;
    images: any[];
    user: { id: string; name: string; image: string };
  };
  requester: {
    id: string;
    name: string;
    image: string;
  };
}

interface Trade {
  id: string;
  trade_request_id: string;
  requested_item_id: string;
  offered_item_id: string;
  requester_id: string;
  owner_id: string;
  location?: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  completed_at?: string;
  created_at: string;
  requested_item: any;
  offered_item: any;
  requester: any;
  owner: any;
  trade_request: {
    requested_at: string;
  };
}

interface TradeRequestCreate {
  requested_item_id: string;
  offered_item_id: string;
}

class TradeService {
  // Create trade request
  async createTradeRequest(data: TradeRequestCreate): Promise<TradeRequest> {
    const response = await apiClient.post<TradeRequest>('/trades/request', data);
    return response.data;
  }

  // Accept trade request (item owner only)
  async acceptTradeRequest(requestId: string): Promise<Trade> {
    const response = await apiClient.post<Trade>(`/trades/accept/${requestId}`);
    return response.data;
  }

  // Reject trade request (item owner only)  
  async rejectTradeRequest(requestId: string): Promise<void> {
    await apiClient.post(`/trades/reject/${requestId}`);
  }

  // Complete trade (either party)
  async completeTrade(tradeId: string): Promise<Trade> {
    const response = await apiClient.post<Trade>(`/trades/complete/${tradeId}`);
    return response.data;
  }

  // Cancel trade (either party)
  async cancelTrade(tradeId: string): Promise<Trade> {
    const response = await apiClient.post<Trade>(`/trades/cancel/${tradeId}`);
    return response.data;
  }

  // Get user's active trades
  async getMyTrades(): Promise<Trade[]> {
    const response = await apiClient.get<Trade[]>('/trades/my-trades');
    return response.data;
  }

  // Get received trade requests
  async getReceivedRequests(): Promise<TradeRequest[]> {
    const response = await apiClient.get<TradeRequest[]>('/trades/requests/received');
    return response.data;
  }

  // Get sent trade requests
  async getSentRequests(page: number = 1, limit: number = 20): Promise<{
    requests: TradeRequest[];
    pagination: any;
  }> {
    const response = await apiClient.get<{
      requests: TradeRequest[];
      pagination: any;
    }>('/trades/requests/sent', { page, limit });
    return response.data;
  }

  // Get all trade requests for current user (both sent and received)
  async getAllTradeRequests(): Promise<{
    sent: TradeRequest[];
    received: TradeRequest[];
  }> {
    const [sentResponse, receivedResponse] = await Promise.all([
      this.getSentRequests(),
      this.getReceivedRequests()
    ]);

    return {
      sent: sentResponse.requests || [],
      received: receivedResponse
    };
  }

  // Check if user can trade (has available items)
  async canTrade(): Promise<boolean> {
    // This would typically check if user has available items
    // You might want to implement this based on your needs
    return true;
  }

  // Get trade statistics for user
  async getTradeStats(): Promise<{
    totalTrades: number;
    completedTrades: number;
    pendingRequests: number;
    activeDeals: number;
  }> {
    const [trades, requests] = await Promise.all([
      this.getMyTrades(),
      this.getAllTradeRequests()
    ]);

    const completedTrades = trades.filter(t => t.status === 'COMPLETED').length;
    const pendingRequests = requests.received.filter(r => r.status === 'PENDING').length;
    const activeDeals = trades.filter(t => t.status === 'PENDING').length;

    return {
      totalTrades: trades.length,
      completedTrades,
      pendingRequests,
      activeDeals
    };
  }
}

export const tradeService = new TradeService();
export default tradeService;

// Export types for use in components
export type { TradeRequest, Trade, TradeRequestCreate };
