import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pinService } from '@/services/pin';
import { toast } from 'sonner';

// Query keys for PIN operations
export const pinQueryKeys = {
  all: ['pins'] as const,
  status: (tradeId: string) => ['pins', 'status', tradeId] as const,
  details: (tradeId: string) => ['pins', 'details', tradeId] as const,
};

// Hook to generate PIN
export const useGeneratePin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tradeId: string) => pinService.generatePin(tradeId),
    onSuccess: (data, tradeId) => {
      console.log('PIN generated successfully:', data);
      // Aggressively invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: pinQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: pinQueryKeys.status(tradeId) });
      queryClient.invalidateQueries({ queryKey: pinQueryKeys.details(tradeId) });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      
      // Force immediate refetch of status
      queryClient.refetchQueries({ queryKey: pinQueryKeys.status(tradeId) });
      
      toast.success('PIN generated successfully!');
    },
    onError: (error: Error) => {
      console.error('PIN generation failed:', error);
      toast.error(error.message || 'Failed to generate PIN');
    },
  });
};

// Hook to get PIN details
export const usePinDetails = (tradeId: string, enabled = true) => {
  return useQuery({
    queryKey: pinQueryKeys.details(tradeId),
    queryFn: () => pinService.getPinDetails(tradeId),
    enabled: enabled && !!tradeId,
    retry: 1,
    staleTime: 30000, // 30 seconds
  });
};

// Hook to verify PIN
export const useVerifyPin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tradeId, pin }: { tradeId: string; pin: string }) => 
      pinService.verifyPin(tradeId, pin),
    onSuccess: (data, { tradeId }) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: pinQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success('Trade completed successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify PIN');
    },
  });
};

// Hook to get PIN status
export const usePinStatus = (tradeId: string, enabled = true) => {
  return useQuery({
    queryKey: pinQueryKeys.status(tradeId),
    queryFn: async () => {
      console.log('Fetching PIN status for trade:', tradeId);
      try {
        const result = await pinService.getPinStatus(tradeId);
        console.log('PIN status result:', result);
        return result;
      } catch (error) {
        console.error('PIN status query error:', error);
        throw error;
      }
    },
    enabled: enabled && !!tradeId,
    retry: (failureCount, error) => {
      console.log('PIN status query failed, retrying:', error);
      return failureCount < 2;
    },
    refetchInterval: (query) => {
      // More aggressive polling when waiting for PIN or when PIN is active
      const data = query.state.data;
      if (!data?.exists) {
        return 2000; // Poll every 2 seconds when no PIN exists
      }
      if (data.exists && !data.isVerified && !data.isExpired) {
        return 3000; // Poll every 3 seconds when PIN is active
      }
      // Stop polling when PIN is verified or expired
      return false;
    },
    staleTime: 500, // Consider data stale after 0.5 seconds
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
};
