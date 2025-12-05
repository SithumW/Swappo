// services/userService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserService {

  /**
   * Get user profile by ID
   */
  static async getUserProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        latitude: true,
        longitude: true,
        bio: true,
        loyalty_points: true,
        badge: true,
        createdAt: true,
        _count: {
          select: {
            items: { where: { status: 'AVAILABLE' } },
            // trades_as_user1: { where: { status: 'COMPLETED' } },
            // trades_as_user2: { where: { status: 'COMPLETED' } },
            // given_ratings: true,
            // received_ratings: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate additional stats
    // const completedTrades = user._count.trades_as_user1 + user._count.trades_as_user2;
    
    // Calculate average rating
    // const ratings = await prisma.userRating.findMany({
    //   where: { rated_id: userId },
    //   select: { rating: true }
    // });

    // const averageRating = ratings.length > 0 
    //   ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length 
    //   : 0;

    return {
      ...user,
      // completedTrades,
      // averageRating: Math.round(averageRating * 10) / 10
    };
  }

  /**
   * Update user profile
   */
  static async updateUserProfile(userId, updateData) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (updateData.email && updateData.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email }
      });

      if (emailExists) {
        throw new Error('Email is already taken');
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...updateData,
        updatedAt: new Date()
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        latitude: true,
        longitude: true,
        bio: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return updatedUser;
  }

  /**
   * Search users
   */
  static async searchUsers(query, pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        },
        select: {
          id: true,
          name: true,
          image: true,
          latitude: true,
          longitude: true,
          badge: true,
          _count: {
            select: {
              items: { where: { status: 'AVAILABLE' } }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.user.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } }
          ]
        }
      })
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user's items
   */
  static async getUserItems(userId, pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where: { user_id: userId },
        include: {
          images: true,
          _count: {
            select: { 
              trade_requests_for: { where: { status: 'PENDING' } }
            }
          }
        },
        orderBy: { posted_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.item.count({ where: { user_id: userId } })
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get user's trade history
   */
  static async getUserTrades(userId, pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // For now, return empty array since Trade model relationships need to be confirmed
    return {
      trades: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    };

    // TODO: Implement when Trade model relationships are confirmed
    // const [trades, total] = await Promise.all([
    //   prisma.trade.findMany({
    //     where: {
    //       OR: [
    //         { user1_id: userId },
    //         { user2_id: userId }
    //       ]
    //     },
    //     include: {
    //       requested_item: {
    //         include: { images: true }
    //       },
    //       offered_item: {
    //         include: { images: true }
    //       },
    //       user1: {
    //         select: { id: true, name: true, image: true }
    //       },
    //       user2: {
    //         select: { id: true, name: true, image: true }
    //       }
    //     },
    //     orderBy: { created_at: 'desc' },
    //     skip,
    //     take: limit
    //   }),
    //   prisma.trade.count({
    //     where: {
    //       OR: [
    //         { user1_id: userId },
    //         { user2_id: userId }
    //       ]
    //     }
    //   })
    // ]);
  }

  /**
   * Get user's reviews
   */
  static async getUserReviews(userId, type, pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // For now, return empty array since UserRating model needs to be confirmed
    return {
      reviews: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0
      }
    };

    // TODO: Implement when UserRating model is confirmed
    // const whereClause = type === 'given' 
    //   ? { rater_id: userId }
    //   : { rated_id: userId };

    // const [reviews, total] = await Promise.all([
    //   prisma.userRating.findMany({
    //     where: whereClause,
    //     include: {
    //       rater: {
    //         select: { id: true, name: true, image: true }
    //       },
    //       rated: {
    //         select: { id: true, name: true, image: true }
    //       },
    //       trade: {
    //         select: {
    //           id: true,
    //           requested_item: { select: { title: true } },
    //           offered_item: { select: { title: true } }
    //         }
    //       }
    //     },
    //     orderBy: { created_at: 'desc' },
    //     skip,
    //     take: limit
    //   }),
    //   prisma.userRating.count({ where: whereClause })
    // ]);
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(pagination) {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // For now, return basic user list
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          image: true,
          // badge: true,
          // loyalty_points: true,
          _count: {
            select: {
              items: { where: { status: 'TRADED' } }
            }
          }
        },
        orderBy: [
          // { loyalty_points: 'desc' },
          { name: 'asc' }
        ],
        skip,
        take: limit
      }),
      prisma.user.count()
    ]);

    return {
      users: users.map((user, index) => ({
        ...user,
        rank: skip + index + 1,
        tradedItems: user._count.items
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }
}
