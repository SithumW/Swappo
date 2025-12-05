import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tradeService } from '@/services/trade';
import { toast } from 'sonner';
import { TradeRequest, Trade, TradeRequestCreate } from '@/types/api';

// Query keys
export const tradeQueryKeys = {
  all: ['trades'] as const,
  myTrades: () => [...tradeQueryKeys.all, 'my-trades'] as const,
  receivedRequests: () => [...tradeQueryKeys.all, 'received-requests'] as const,
  sentRequests: () => [...tradeQueryKeys.all, 'sent-requests'] as const,
};

// Hook to get user's trades
export const useMyTrades = () => {
  return useQuery({
    queryKey: tradeQueryKeys.myTrades(),
    queryFn: () => tradeService.getMyTrades(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Hook to get received trade requests
export const useReceivedRequests = () => {
  return useQuery({
    queryKey: tradeQueryKeys.receivedRequests(),
    queryFn: () => tradeService.getReceivedRequests(),
    staleTime: 1 * 60 * 1000, // 1 minute - more frequent updates for pending requests
  });
};

// Hook to get sent trade requests
export const useSentRequests = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: [...tradeQueryKeys.sentRequests(), page, limit],
    queryFn: () => tradeService.getSentRequests(page, limit),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
};

// Hook to create trade request
export const useCreateTradeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TradeRequestCreate) => tradeService.createTradeRequest(data),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.sentRequests() });
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.all });
      toast.success('Trade request sent successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send trade request');
    },
  });
};

// Hook to accept trade request
export const useAcceptTradeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => tradeService.acceptTradeRequest(requestId),
    onSuccess: () => {
      // Invalidate all trade-related queries
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.all });
      toast.success('Trade request accepted! Trade has been created.');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to accept trade request');
    },
  });
};

// Hook to reject trade request
export const useRejectTradeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => tradeService.rejectTradeRequest(requestId),
    onSuccess: () => {
      // Invalidate received requests to remove the rejected request
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.receivedRequests() });
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.all });
      toast.success('Trade request rejected');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject trade request');
    },
  });
};

// Hook to cancel trade request (for sent requests)
export const useCancelTradeRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) => tradeService.cancelTradeRequest(requestId),
    onSuccess: () => {
      // Invalidate sent requests to remove the cancelled request
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.sentRequests() });
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.all });
      toast.success('Trade request cancelled');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel trade request');
    },
  });
};

// Hook to complete trade
export const useCompleteTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeId: string) => tradeService.completeTrade(tradeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tradeQueryKeys.all });
      toast.success('Trade completed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete trade');
    },
  });
};
