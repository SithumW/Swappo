// services/ratingService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class RatingService {

  /**
   * Create a new rating
   */
  static async createRating(ratingData, raterId) {
    const { reviewee_id, trade_id, rating, comment } = ratingData;

    // Validate user is not rating themselves
    if (raterId === reviewee_id) {
      throw new Error('You cannot rate yourself');
    }

    // Validate the trade and user's involvement
    // Try to find trade by both id and trade_request_id to handle different frontend implementations
    const trade = await prisma.trade.findFirst({
      where: { 
        OR: [
          { id: trade_id },
          { trade_request_id: trade_id }
        ]
      },
      select: { 
        id: true,
        trade_request_id: true,
        owner_id: true, 
        requester_id: true, 
        status: true
      }
    });

    if (!trade) {
      throw new Error('Trade not found');
    }

    if (trade.status !== 'COMPLETED') {
      throw new Error('You can only rate users from completed trades');
    }

    // Validate the rater was part of the trade
    const isUserInTrade = trade.owner_id === raterId || trade.requester_id === raterId;
    if (!isUserInTrade) {
      throw new Error('You can only rate users from trades you participated in');
    }

    // Validate the rated user was part of the trade and is the other party
    const isRatedUserInTrade = trade.owner_id === reviewee_id || trade.requester_id === reviewee_id;
    if (!isRatedUserInTrade) {
      throw new Error('You can only rate the other party in the trade');
    }

    // Check if rating already exists for this trade - use the actual trade ID
    const existingRating = await prisma.rating.findFirst({
      where: {
        reviewer_id: raterId,
        reviewee_id: reviewee_id,
        trade_id: trade.id  // Use the actual trade ID from the database
      }
    });

    if (existingRating) {
      throw new Error('You have already rated this user for this trade');
    }

    // Create the rating and update loyalty points in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the rating
      const newRating = await tx.rating.create({
        data: {
          reviewer_id: raterId,
          reviewee_id,
          trade_id: trade.id,  // Use the actual trade ID
          rating,
          comment: comment || null
        },
        include: {
          reviewer: {
            select: { id: true, name: true, image: true }
          },
          reviewee: {
            select: { id: true, name: true, image: true }
          },
          trade: {
            select: {
              id: true,
              requested_item: { select: { title: true } },
              offered_item: { select: { title: true } }
            }
          }
        }
      });

      // Calculate loyalty points (5 points per star)
      const loyaltyPoints = rating * 5;

      // Add loyalty points to the reviewee
      await tx.user.update({
        where: { id: reviewee_id },
        data: {
          loyalty_points: {
            increment: loyaltyPoints
          }
        }
      });

      return newRating;
    });

    return result;
  }

  /**
   * Update a rating
   */
  static async updateRating(ratingId, raterId, updateData) {
    const existingRating = await prisma.rating.findUnique({
      where: { id: ratingId },
      select: { 
        reviewer_id: true,
        trade_id: true,
        rating: true,
        reviewee_id: true
      }
    });

    if (!existingRating) {
      throw new Error('Rating not found');
    }

    if (existingRating.reviewer_id !== raterId) {
      throw new Error('You can only update your own ratings');
    }

    // If rating value is being updated, calculate loyalty point difference
    let loyaltyPointsDiff = 0;
    if (updateData.rating && updateData.rating !== existingRating.rating) {
      const oldPoints = existingRating.rating * 5;
      const newPoints = updateData.rating * 5;
      loyaltyPointsDiff = newPoints - oldPoints;
    }

    // Update rating and loyalty points in a transaction if needed
    const result = await prisma.$transaction(async (tx) => {
      const updatedRating = await tx.rating.update({
        where: { id: ratingId },
        data: updateData,
        include: {
          reviewer: {
            select: { id: true, name: true, image: true }
          },
          reviewee: {
            select: { id: true, name: true, image: true }
          },
          trade: {
            select: {
              id: true,
              requested_item: { select: { title: true } },
              offered_item: { select: { title: true } }
            }
          }
        }
      });

      // Update loyalty points if rating changed
      if (loyaltyPointsDiff !== 0) {
        await tx.user.update({
          where: { id: existingRating.reviewee_id },
          data: {
            loyalty_points: {
              increment: loyaltyPointsDiff
            }
          }
        });
      }

      return updatedRating;
    });

    return result;
  }

  /**
   * Delete a rating
   */
  static async deleteRating(ratingId, raterId) {
    const existingRating = await prisma.rating.findUnique({
      where: { id: ratingId },
      select: { reviewer_id: true, rating: true, reviewee_id: true }
    });

    if (!existingRating) {
      throw new Error('Rating not found');
    }

    if (existingRating.reviewer_id !== raterId) {
      throw new Error('You can only delete your own ratings');
    }

    // Delete rating and adjust loyalty points in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete the rating
      await tx.rating.delete({
        where: { id: ratingId }
      });

      // Subtract loyalty points that were given for this rating
      const pointsToSubtract = existingRating.rating * 5;
      await tx.user.update({
        where: { id: existingRating.reviewee_id },
        data: {
          loyalty_points: {
            decrement: pointsToSubtract
          }
        }
      });
    });

    return { message: 'Rating deleted successfully' };
  }

  /**
   * Get ratings for a user (ratings they received)
   */
  static async getUserRatings(userId, type = 'received') {
    

    const whereClause = type === 'given' 
      ? { reviewer_id: userId }
      : { reviewee_id: userId };

    const [ratings, total, averageRating] = await Promise.all([
      prisma.rating.findMany({
        where: whereClause,
        include: {
          reviewer: {
            select: { id: true, name: true, image: true }
          },
          reviewee: {
            select: { id: true, name: true, image: true }
          },
          trade: {
            select: {
              id: true,
              requested_item: { select: { title: true } },
              offered_item: { select: { title: true } }
            }
          }
        },
        orderBy: { created_at: 'desc' }
      }),
      prisma.rating.count({ where: whereClause }),
      prisma.rating.aggregate({
        where: whereClause,
        _avg: { rating: true },
        _count: { rating: true }
      })
    ]);

    return {
      ratings,
      statistics: {
        averageRating: averageRating._avg.rating ? 
          Math.round(averageRating._avg.rating * 10) / 10 : 0,
        totalRatings: averageRating._count.rating
      }
    };
  }

  /**
   * Get rating statistics for a user
   */
  static async getUserRatingStats(userId) {
    const [receivedStats, givenStats, ratingDistribution] = await Promise.all([
      // Stats for ratings received
      prisma.rating.aggregate({
        where: { reviewee_id: userId },
        _avg: { rating: true },
        _count: { rating: true },
        _min: { rating: true },
        _max: { rating: true }
      }),
      // Stats for ratings given
      prisma.rating.aggregate({
        where: { reviewer_id: userId },
        _avg: { rating: true },
        _count: { rating: true }
      }),
      // Distribution of ratings received
      prisma.rating.groupBy({
        by: ['rating'],
        where: { reviewee_id: userId },
        _count: { rating: true },
        orderBy: { rating: 'asc' }
      })
    ]);

    const distribution = Array.from({ length: 5 }, (_, i) => {
      const rating = i + 1;
      const found = ratingDistribution.find(d => d.rating === rating);
      return {
        rating,
        count: found ? found._count.rating : 0
      };
    });

    return {
      received: {
        average: receivedStats._avg.rating ? 
          Math.round(receivedStats._avg.rating * 10) / 10 : 0,
        total: receivedStats._count.rating,
        min: receivedStats._min.rating || 0,
        max: receivedStats._max.rating || 0,
        distribution
      },
      given: {
        average: givenStats._avg.rating ? 
          Math.round(givenStats._avg.rating * 10) / 10 : 0,
        total: givenStats._count.rating
      }
    };
  }

  /**
   * Get pending ratings (trades that can be rated)
   */
  static async getPendingRatings(userId, pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Find completed trades where user hasn't rated the other party yet
    const [pendingRatings, total] = await Promise.all([
      prisma.trade.findMany({
        where: {
          AND: [
            { status: 'COMPLETED' },
            {
              OR: [
                { user1_id: userId },
                { user2_id: userId }
              ]
            },
            // No existing rating from this user for this trade
            {
              ratings: {
                none: {
                  rater_id: userId
                }
              }
            }
          ]
        },
        include: {
          user1: {
            select: { id: true, name: true, image: true }
          },
          user2: {
            select: { id: true, name: true, image: true }
          },
          requested_item: {
            select: { title: true, images: true }
          },
          offered_item: {
            select: { title: true, images: true }
          }
        },
        orderBy: { completed_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.trade.count({
        where: {
          AND: [
            { status: 'COMPLETED' },
            {
              OR: [
                { user1_id: userId },
                { user2_id: userId }
              ]
            },
            {
              ratings: {
                none: {
                  rater_id: userId
                }
              }
            }
          ]
        }
      })
    ]);

    // Format the response to include the user to be rated
    const formattedPendingRatings = pendingRatings.map(trade => {
      const otherUser = trade.user1_id === userId ? trade.user2 : trade.user1;
      return {
        trade: {
          id: trade.id,
          completed_at: trade.completed_at,
          requested_item: trade.requested_item,
          offered_item: trade.offered_item
        },
        userToRate: otherUser
      };
    });

    return {
      pendingRatings: formattedPendingRatings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
