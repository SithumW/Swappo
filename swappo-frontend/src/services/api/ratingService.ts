import { apiClient } from '../api';
import { ApiResponse } from '@/types/api';

// Rating types based on your API documentation
interface Rating {
  id: string;
  trade_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number; // 1-5 stars
  comment?: string;
  created_at: string;
  trade: any;
  reviewer: any;
  reviewee: any;
}

interface RatingCreate {
  trade_id: string;
  reviewee_id: string;
  rating: number; // 1-5
  comment?: string;
}

interface RatingUpdate {
  rating?: number;
  comment?: string;
}

interface RatingStats {
  average_rating: number;
  total_ratings: number;
  rating_distribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
}

class RatingService {
  // Create new rating
  async createRating(data: RatingCreate): Promise<Rating> {
    const response = await apiClient.post<Rating>('/ratings', data);
    return response.data;
  }

  // Update existing rating (reviewer only)
  async updateRating(ratingId: string, data: RatingUpdate): Promise<Rating> {
    const response = await apiClient.put<Rating>(`/ratings/${ratingId}`, data);
    return response.data;
  }

  // Delete rating (reviewer only)
  async deleteRating(ratingId: string): Promise<void> {
    await apiClient.delete(`/ratings/${ratingId}`);
  }

  // Get ratings for specific user
  async getUserRatings(userId: string): Promise<Rating[]> {
    const response = await apiClient.get<Rating[]>(`/ratings/user/${userId}`);
    return response.data;
  }

  // Get user's rating statistics
  async getUserRatingStats(userId: string): Promise<RatingStats> {
    const response = await apiClient.get<RatingStats>(`/ratings/stats/${userId}`);
    return response.data;
  }

  // Check if user can rate another user for a specific trade
  async canRate(tradeId: string, revieweeId: string): Promise<boolean> {
    try {
      // This would typically check if:
      // 1. Trade is completed
      // 2. Current user participated in the trade
      // 3. User hasn't already rated this person for this trade
      // For now, we'll assume it's always possible
      return true;
    } catch (error) {
      return false;
    }
  }

  // Get rating breakdown for display
  async getRatingBreakdown(userId: string): Promise<{
    average: number;
    total: number;
    breakdown: { stars: number; count: number; percentage: number }[];
    recentReviews: Rating[];
  }> {
    const [stats, ratings] = await Promise.all([
      this.getUserRatingStats(userId),
      this.getUserRatings(userId)
    ]);

    const breakdown = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: stats.rating_distribution[stars.toString() as keyof typeof stats.rating_distribution] || 0,
      percentage: stats.total_ratings > 0 
        ? ((stats.rating_distribution[stars.toString() as keyof typeof stats.rating_distribution] || 0) / stats.total_ratings) * 100 
        : 0
    }));

    // Get most recent 5 reviews
    const recentReviews = ratings
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

    return {
      average: stats.average_rating,
      total: stats.total_ratings,
      breakdown,
      recentReviews
    };
  }

  // Calculate user's overall reputation level
  getReputationLevel(averageRating: number, totalRatings: number): {
    level: string;
    color: string;
    description: string;
  } {
    if (totalRatings === 0) {
      return {
        level: 'New Trader',
        color: 'gray',
        description: 'No ratings yet'
      };
    }

    if (averageRating >= 4.5 && totalRatings >= 20) {
      return {
        level: 'Excellent Trader',
        color: 'green',
        description: 'Highly trusted member'
      };
    }

    if (averageRating >= 4.0 && totalRatings >= 10) {
      return {
        level: 'Good Trader',
        color: 'blue',
        description: 'Reliable trading partner'
      };
    }

    if (averageRating >= 3.5 && totalRatings >= 5) {
      return {
        level: 'Fair Trader',
        color: 'yellow',
        description: 'Decent trading history'
      };
    }

    if (averageRating >= 3.0) {
      return {
        level: 'Average Trader',
        color: 'orange',
        description: 'Mixed trading experience'
      };
    }

    return {
      level: 'New Trader',
      color: 'red',
      description: 'Building reputation'
    };
  }
}

export const ratingService = new RatingService();
export default ratingService;

// Export types for use in components
export type { Rating, RatingCreate, RatingUpdate, RatingStats };
