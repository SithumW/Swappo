// services/tradeService.js
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class TradeService {

  /**
   * Create a new trade request
   */
  static async createTradeRequest(requestData, requesterId) {
    const { requested_item_id, offered_item_id } = requestData;

    // Validate items exist and are available
    const [requestedItem, offeredItem] = await Promise.all([
      prisma.item.findUnique({
        where: { id: requested_item_id },
        select: { id: true, user_id: true, status: true, title: true }
      }),
      prisma.item.findUnique({
        where: { id: offered_item_id },
        select: { id: true, user_id: true, status: true, title: true }
      })
    ]);

    // Validation checks
    if (!requestedItem) {
      throw new Error('Requested item not found');
    }

    if (!offeredItem) {
      throw new Error('Offered item not found');
    }

    if (requestedItem.status !== 'AVAILABLE') {
      throw new Error('Requested item is not available');
    }

    if (offeredItem.status !== 'AVAILABLE') {
      throw new Error('Offered item is not available');
    }

    if (offeredItem.user_id !== requesterId) {
      throw new Error('You can only offer your own items');
    }

    if (requestedItem.user_id === requesterId) {
      throw new Error('Cannot request your own item');
    }

    // Check for existing pending request
    const existingRequest = await prisma.tradeRequest.findFirst({
      where: {
        requester_id: requesterId,
        requested_item_id,
        offered_item_id,
        status: 'PENDING'
      }
    });

    if (existingRequest) {
      throw new Error('You already have a pending request for this trade');
    }

    // Create trade request
    const tradeRequest = await prisma.tradeRequest.create({
      data: {
        requester_id: requesterId,
        requested_item_id,
        offered_item_id,
        status: 'PENDING'
      },
      include: {
        requester: {
          select: { id: true, name: true, image: true }
        },
        requested_item: {
          include: { 
            images: true,
            user: { select: { id: true, name: true, image: true } }
          }
        },
        offered_item: {
          include: { 
            images: true
          }
        }
      }
    });

    return tradeRequest;
  }

  /**
   * Accept a trade request
   */
  static async acceptTradeRequest(requestId, userId) {
    // Get the trade request with all related data
    const tradeRequest = await prisma.tradeRequest.findUnique({
      where: { id: requestId },
      include: {
        requested_item: { 
          select: { id: true, user_id: true, status: true, title: true }
        },
        offered_item: { 
          select: { id: true, user_id: true, status: true, title: true }
        },
        requester: {
          select: { id: true, name: true, image: true }
        }
      }
    });

    if (!tradeRequest) {
      throw new Error('Trade request not found');
    }

    // Validate user can accept (owns the requested item)
    if (tradeRequest.requested_item.user_id !== userId) {
      throw new Error('You can only accept requests for your own items');
    }

    if (tradeRequest.status !== 'PENDING') {
      throw new Error('Trade request is no longer pending');
    }

    // Verify items are still available
    if (tradeRequest.requested_item.status !== 'AVAILABLE') {
      throw new Error('Your item is no longer available');
    }

    if (tradeRequest.offered_item.status !== 'AVAILABLE') {
      throw new Error('Offered item is no longer available');
    }

    // Create a transaction to handle the acceptance
    const result = await prisma.$transaction(async (tx) => {
      // Update trade request status
      const updatedRequest = await tx.tradeRequest.update({
        where: { id: requestId },
        data: { 
          status: 'ACCEPTED'
        }
      });

      // Create trade record
      const trade = await tx.trade.create({
        data: {
          trade_request_id: requestId,
          owner_id: userId, // Item owner
          requester_id: tradeRequest.requester_id, // Item requester  
          requested_item_id: tradeRequest.requested_item_id,
          offered_item_id: tradeRequest.offered_item_id,
          status: 'PENDING'
        }
      });

      // Update item statuses to RESERVED
      await Promise.all([
        tx.item.update({
          where: { id: tradeRequest.requested_item_id },
          data: { status: 'RESERVED' }
        }),
        tx.item.update({
          where: { id: tradeRequest.offered_item_id },
          data: { status: 'RESERVED' }
        })
      ]);

      // Reject all other pending requests for these items
      await tx.tradeRequest.updateMany({
        where: {
          AND: [
            { id: { not: requestId } },
            { status: 'PENDING' },
            {
              OR: [
                { requested_item_id: tradeRequest.requested_item_id },
                { requested_item_id: tradeRequest.offered_item_id },
                { offered_item_id: tradeRequest.requested_item_id },
                { offered_item_id: tradeRequest.offered_item_id }
              ]
            }
          ]
        },
        data: { 
          status: 'REJECTED'
        }
      });

      return { trade, tradeRequest: updatedRequest };
    });

    return result;
  }

  /**
   * Reject a trade request
   */
  static async rejectTradeRequest(requestId, userId) {
    const tradeRequest = await prisma.tradeRequest.findUnique({
      where: { id: requestId },
      include: {
        requested_item: { 
          select: { user_id: true }
        }
      }
    });

    if (!tradeRequest) {
      throw new Error('Trade request not found');
    }

    // Validate user can reject (owns the requested item)
    if (tradeRequest.requested_item.user_id !== userId) {
      throw new Error('You can only reject requests for your own items');
    }

    if (tradeRequest.status !== 'PENDING') {
      throw new Error('Trade request is no longer pending');
    }

    const updatedRequest = await prisma.tradeRequest.update({
      where: { id: requestId },
      data: { 
        status: 'REJECTED'
      },
      include: {
        requester: {
          select: { id: true, name: true, image: true }
        },
        requested_item: {
          include: { images: true }
        },
        offered_item: {
          include: { images: true }
        }
      }
    });

    return updatedRequest;
  }

  /**
   * Complete a trade
   */
  static async completeTrade(tradeId, userId) {
    const trade = await prisma.trade.findUnique({
      where: { trade_request_id: tradeId },
      include: {
        requested_item: { select: { id: true, user_id: true, title: true } },
        offered_item: { select: { id: true, user_id: true, title: true } }
      }
    });


    if (!trade) {
      throw new Error('Trade not found');
    }

    // Validate user is part of the trade
    if (trade.owner_id !== userId && trade.requester_id !== userId) {
      throw new Error('You are not authorized to complete this trade');
    }

    if (trade.status !== 'PENDING') {
      throw new Error('Trade is not in pending status');
    }

    // Complete the trade
    const result = await prisma.$transaction(async (tx) => {
      // Update trade status
      const completedTrade = await tx.trade.update({
        where: { trade_request_id: tradeId },
        data: { 
          status: 'COMPLETED',
          completed_at: new Date()
        }
      });

      // Update item statuses to SWAPPED
      await Promise.all([
        tx.item.update({
          where: { id: trade.requested_item_id },
          data: { status: 'SWAPPED' }
        }),
        tx.item.update({
          where: { id: trade.offered_item_id },
          data: { status: 'SWAPPED' }
        })
      ]);

      // Create swapped items records
      await Promise.all([
        tx.swappedItem.create({
          data: {
            trade_id: trade.id,
            item_id: trade.requested_item_id,
            user_id: trade.requester_id // Requester gets the requested item
          }
        }),
        tx.swappedItem.create({
          data: {
            trade_id: trade.id,
            item_id: trade.offered_item_id,
            user_id: trade.owner_id // Owner gets the offered item
          }
        })
      ]);

      return completedTrade;
    });

    return result;
  }

  /**
   * Cancel a trade
   */
  static async cancelTrade(tradeId, userId) {
    const trade = await prisma.trade.findUnique({
      where: { id: tradeId },
      include: {
        requested_item: { select: { id: true } },
        offered_item: { select: { id: true } }
      }
    });

    if (!trade) {
      throw new Error('Trade not found');
    }

    // Validate user is part of the trade
    if (trade.owner_id !== userId && trade.requester_id !== userId) {
      throw new Error('You are not authorized to cancel this trade');
    }

    if (trade.status === 'COMPLETED') {
      throw new Error('Cannot cancel a completed trade');
    }

    if (trade.status === 'CANCELLED') {
      throw new Error('Trade is already cancelled');
    }

    // Cancel the trade
    const result = await prisma.$transaction(async (tx) => {
      // Update trade status
      const cancelledTrade = await tx.trade.update({
        where: { id: tradeId },
        data: { 
          status: 'CANCELLED'
        }
      });

      // Revert item statuses to AVAILABLE
      await Promise.all([
        tx.item.update({
          where: { id: trade.requested_item_id },
          data: { status: 'AVAILABLE' }
        }),
        tx.item.update({
          where: { id: trade.offered_item_id },
          data: { status: 'AVAILABLE' }
        })
      ]);

      return cancelledTrade;
    });

    return result;
  }

  /**
   * Cancel a pending trade request (for sent requests)
   */
  static async cancelTradeRequest(requestId, userId) {
    const tradeRequest = await prisma.tradeRequest.findUnique({
      where: { id: requestId }
    });

    if (!tradeRequest) {
      throw new Error('Trade request not found');
    }

    // Validate user is the requester
    if (tradeRequest.requester_id !== userId) {
      throw new Error('You can only cancel your own trade requests');
    }

    if (tradeRequest.status !== 'PENDING') {
      throw new Error('Trade request is no longer pending and cannot be cancelled');
    }

    // Update the trade request status to CANCELLED
    const cancelledRequest = await prisma.tradeRequest.update({
      where: { id: requestId },
      data: { 
        status: 'CANCELLED'
      }
    });

    return cancelledRequest;
  }

  /**
   * Get user's trades
   */
  static async getUserTrades(userId) {
    const trades = await prisma.trade.findMany({
      where: {
        OR: [
          { owner_id: userId },
          { requester_id: userId }
        ]
      },
      include: {
        trade_request: {
          select: { requested_at: true }
        },
        requested_item: {
          include: { 
            images: true,
            user: { select: { id: true, name: true, image: true } }
          }
        },
        offered_item: {
          include: { 
            images: true,
            user: { select: { id: true, name: true, image: true } }
          }
        },
        owner: {
          select: { id: true, name: true, image: true }
        },
        requester: {
          select: { id: true, name: true, image: true }
        }
      },
      orderBy: { created_at: 'desc' }
    });
    console.log(trades);
    return trades;
  }

  /**
   * Get received trade requests
   */
  static async getReceivedRequests(userId) {
    const requests = await prisma.tradeRequest.findMany({
      where: {
        requested_item: {
          user_id: userId
        }
      },
      include: {
        requester: {
          select: { id: true, name: true, image: true }
        },
        requested_item: {
          include: { images: true }
        },
        offered_item: {
          include: { 
            images: true,
            user: { select: { id: true, name: true, image: true } }
          }
        },
        trade: {
          select: { 
            id: true, 
            status: true, 
            completed_at: true,
            created_at: true,
            owner_id: true,
            requester_id: true
          }
        }
      },
      orderBy: { requested_at: 'desc' }
    });

    return requests;
  }

  /**
   * Get sent trade requests
   */
  static async getSentRequests(userId, pagination = { page: 1, limit: 50 }) {

    const [requests, total] = await Promise.all([
      prisma.tradeRequest.findMany({
        where: {
          requester_id: userId
        },
        include: {
          requested_item: {
            include: { 
              images: true,
              user: { select: { id: true, name: true, image: true } }
            }
          },
          offered_item: {
            include: { images: true }
          },
          trade: { 
            select: { 
              id: true, 
              status: true, 
              completed_at: true,
              created_at: true,
              owner_id: true,
              requester_id: true
            }
          }
        },
        orderBy: { requested_at: 'desc' }
      }),
      prisma.tradeRequest.count({
        where: {
          requester_id: userId
        }
      })
    ]);

    return {
      requests
    };
  }

  /**
   * Get completed trades for a user
   */
  static async getCompletedTrades(userId) {
    const completedTrades = await prisma.trade.findMany({
      where: {
        AND: [
          { status: 'COMPLETED' },
          {
            OR: [
              { owner_id: userId },
              { requester_id: userId }
            ]
          }
        ]
      },
      include: {
        requested_item: {
          include: { 
            images: true,
            user: { select: { id: true, name: true, image: true } }
          }
        },
        offered_item: {
          include: { 
            images: true,
            user: { select: { id: true, name: true, image: true } }
          }
        },
        owner: { select: { id: true, name: true, image: true } },
        requester: { select: { id: true, name: true, image: true } },
        ratings: {
          include: {
            reviewer: { select: { id: true, name: true, image: true } },
            reviewee: { select: { id: true, name: true, image: true } }
          }
        }
      },
      orderBy: { completed_at: 'desc' }
    });

    return completedTrades;
  }
}
