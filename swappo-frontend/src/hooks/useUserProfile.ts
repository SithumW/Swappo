import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/user';
import { User, UserProfile, RatingStats } from '@/types/api';

export const useUserProfile = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => userService.getUserProfile(userId),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useMyProfile = (enabled = true) => {
  return useQuery({
    queryKey: ['user-profile', 'me'],
    queryFn: () => userService.getMyProfile(),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserRatingStats = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-rating-stats', userId],
    queryFn: () => userService.getUserRatingStats(userId),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserItems = (userId: string, status?: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-items', userId, status],
    queryFn: () => userService.getUserItems(userId, status),
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserTrades = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-trades', userId],
    queryFn: () => userService.getUserTrades(userId),
    enabled: !!userId && enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useUserReviews = (userId: string, enabled = true) => {
  return useQuery({
    queryKey: ['user-reviews', userId],
    queryFn: () => userService.getUserReviews(userId),
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
