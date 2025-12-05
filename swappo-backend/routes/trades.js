// routes/trades.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

// Import validation middleware and schemas
import { 
  validateBody, 
  validateParams, 
  validateQuery,
  createSuccessResponse,
  createErrorResponse,
  idParamSchema,
  tradeIdParamSchema
} from '../validation/validationMiddleware.js';

import {
  createTradeSchema,
  tradeStatusSchema,
  userTradesQuerySchema
} from '../validation/tradeValidation.js';

// Import service layer
import { TradeService } from '../services/tradeService.js';

const router = express.Router();

// Create trade request
router.post('/request', 
  authMiddleware,
  validateBody(createTradeSchema),
  async (req, res) => {
    try {
      const tradeRequest = await TradeService.createTradeRequest(req.body, req.user.id);
      res.status(201).json(createSuccessResponse(tradeRequest, 'Trade request created successfully'));
    } catch (error) {
      console.error('Trade request error:', error);
      const statusCode = getErrorStatusCode(error.message);
      res.status(statusCode).json(createErrorResponse(error.message));
    }
  }
);

// Accept trade request
router.post('/accept/:requestId', 
  authMiddleware,
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      const trade = await TradeService.acceptTradeRequest(req.params.requestId, req.user.id);
      res.json(createSuccessResponse(trade, 'Trade request accepted successfully'));
    } catch (error) {
      console.error('Accept trade error:', error);
      const statusCode = getErrorStatusCode(error.message);
      res.status(statusCode).json(createErrorResponse(error.message));
    }
  }
);

// Reject trade request
router.post('/reject/:requestId', 
  authMiddleware,
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      await TradeService.rejectTradeRequest(req.params.requestId, req.user.id);
      res.json(createSuccessResponse(null, 'Trade request rejected successfully'));
    } catch (error) {
      console.error('Reject trade error:', error);
      const statusCode = getErrorStatusCode(error.message);
      res.status(statusCode).json(createErrorResponse(error.message));
    }
  }
);

// Complete trade
router.post('/complete/:tradeId', 
  authMiddleware,
  validateParams(tradeIdParamSchema),
  async (req, res) => {
    try {
      const result = await TradeService.completeTrade(req.params.tradeId, req.user.id);
      res.json(createSuccessResponse(result, 'Trade completed successfully'));
    } catch (error) {
      console.error('Complete trade error:', error);
      const statusCode = getErrorStatusCode(error.message);
      res.status(statusCode).json(createErrorResponse(error.message));
    }
  }
);

// Cancel trade
router.post('/cancel/:tradeId', 
  authMiddleware,
  validateParams(tradeIdParamSchema),
  async (req, res) => {
    try {
      await TradeService.cancelTrade(req.params.tradeId, req.user.id);
      res.json(createSuccessResponse(null, 'Trade cancelled successfully'));
    } catch (error) {
      console.error('Cancel trade error:', error);
      const statusCode = getErrorStatusCode(error.message);
      res.status(statusCode).json(createErrorResponse(error.message));
    }
  }
);

// Cancel trade request (for sent requests)
router.post('/request/cancel/:requestId', 
  authMiddleware,
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      await TradeService.cancelTradeRequest(req.params.requestId, req.user.id);
      res.json(createSuccessResponse(null, 'Trade request cancelled successfully'));
    } catch (error) {
      console.error('Cancel trade request error:', error);
      const statusCode = getErrorStatusCode(error.message);
      res.status(statusCode).json(createErrorResponse(error.message));
    }
  }
);

// Get user's trades
router.get('/my-trades', 
  authMiddleware,
  async (req, res) => {
    try {
      const trades = await TradeService.getUserTrades(req.user.id);
      res.json(createSuccessResponse(trades));
    } catch (error) {
      console.error('Fetch trades error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch trades'));
    }
  }
);

// Get trade requests for user's items
router.get('/requests/received', 
  authMiddleware,
  async (req, res) => {
    try {
      const requests = await TradeService.getReceivedRequests(req.user.id);
      res.json(createSuccessResponse(requests));
    } catch (error) {
      console.error('Fetch received requests error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch trade requests'));
    }
  }
);

// Get trade requests made by user
router.get('/requests/sent', 
  authMiddleware,
  async (req, res) => {
    try {
      const requests = await TradeService.getSentRequests(req.user.id);
      res.json(createSuccessResponse(requests));
    } catch (error) {
      console.error('Fetch sent requests error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch sent requests'));
    }
  }
);

// Get completed trades for current user
router.get('/completed', 
  authMiddleware,
  async (req, res) => {
    try {
      const completedTrades = await TradeService.getCompletedTrades(req.user.id);
      res.json(createSuccessResponse(completedTrades));
    } catch (error) {
      console.error('Fetch completed trades error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch completed trades'));
    }
  }
);

// Get completed trades for a specific user (public)
router.get('/completed/:userId', 
  async (req, res) => {
    try {
      const completedTrades = await TradeService.getCompletedTrades(req.params.userId);
      res.json(createSuccessResponse(completedTrades));
    } catch (error) {
      console.error('Fetch user completed trades error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch completed trades'));
    }
  }
);

// Helper function to determine status code from error message
function getErrorStatusCode(errorMessage) {
  if (errorMessage.includes('not found')) return 404;
  if (errorMessage.includes('Access denied') || errorMessage.includes('can only')) return 403;
  if (errorMessage.includes('already exists') || 
      errorMessage.includes('cannot') || 
      errorMessage.includes('must be') ||
      errorMessage.includes('no longer')) return 400;
  return 500;
}

export default router;