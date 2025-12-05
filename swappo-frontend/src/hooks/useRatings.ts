import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingService } from '@/services/rating';
import { Rating, RatingCreate, RatingStats } from '@/types/api';
import { toast } from 'sonner';

// Get user ratings (ratings they received)
export const useUserRatings = (userId: string) => {
  return useQuery({
    queryKey: ['ratings', 'user', userId],
    queryFn: () => ratingService.getUserRatings(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};

// Get user rating statistics
export const useUserRatingStats = (userId: string) => {
  return useQuery({
    queryKey: ['ratings', 'stats', userId],
    queryFn: () => ratingService.getUserRatingStats(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
  });
};

// Create rating mutation
export const useCreateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RatingCreate) => ratingService.createRating(data),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast.success('Rating submitted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to submit rating');
    },
  });
};

// Update rating mutation
export const useUpdateRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ratingId, data }: { ratingId: string; data: Partial<RatingCreate> }) =>
      ratingService.updateRating(ratingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Rating updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update rating');
    },
  });
};

// Delete rating mutation
export const useDeleteRating = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ratingId: string) => ratingService.deleteRating(ratingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Rating deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete rating');
    },
  });
};
