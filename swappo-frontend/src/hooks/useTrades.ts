import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeService } from '@/services/trade';
import { TradeRequest, Trade, TradeRequestCreate } from '@/types/api';
import { toast } from 'sonner';

// Get user's trades
export const useMyTrades = () => {
  return useQuery({
    queryKey: ['trades', 'my-trades'],
    queryFn: () => tradeService.getMyTrades(),
    refetchOnWindowFocus: false,
  });
};

// Get received trade requests
export const useReceivedRequests = () => {
  return useQuery({
    queryKey: ['trade-requests', 'received'],
    queryFn: () => tradeService.getReceivedRequests(),
    refetchOnWindowFocus: false,
  });
};

// Get sent trade requests
export const useSentRequests = (page?: number, limit?: number) => {
  return useQuery({
    queryKey: ['trade-requests', 'sent', { page, limit }],
    queryFn: () => tradeService.getSentRequests(page, limit),
    refetchOnWindowFocus: false,
  });
};

// Get completed trades
export const useCompletedTrades = (userId?: string) => {
  return useQuery({
    queryKey: ['trades', 'completed', userId],
    queryFn: () => tradeService.getCompletedTrades(userId),
    refetchOnWindowFocus: false,
  });
};

// Create trade request mutation
export const useCreateTradeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TradeRequestCreate) => tradeService.createTradeRequest(data),
    onSuccess: () => {
      // Invalidate trade requests queries
      queryClient.invalidateQueries({ queryKey: ['trade-requests'] });
      toast.success('Trade request sent successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send trade request');
    },
  });
};

// Accept trade request mutation
export const useAcceptTradeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => tradeService.acceptTradeRequest(requestId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['trade-requests'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Trade request accepted!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept trade request');
    },
  });
};

// Reject trade request mutation
export const useRejectTradeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => tradeService.rejectTradeRequest(requestId),
    onSuccess: () => {
      // Invalidate trade requests queries
      queryClient.invalidateQueries({ queryKey: ['trade-requests'] });
      toast.success('Trade request rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reject trade request');
    },
  });
};

// Complete trade mutation
export const useCompleteTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeId: string) => tradeService.completeTrade(tradeId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Trade completed successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to complete trade');
    },
  });
};

// Cancel trade mutation
export const useCancelTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeId: string) => tradeService.cancelTrade(tradeId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      toast.success('Trade cancelled');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to cancel trade');
    },
  });
};
