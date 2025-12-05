// routes/users.js
import express from 'express';
import { authMiddleware } from '../middleware/auth.js';

// Import validation middleware and schemas
import { 
  validateParams, 
  validateQuery, 
  validateBody,
  createSuccessResponse,
  createErrorResponse,
  userIdParamSchema,
  paginationSchema
} from '../validation/validationMiddleware.js';

import {
  updateProfileSchema,
  userSearchSchema,
  userItemsQuerySchema
} from '../validation/userValidation.js';

// Import service layer
import { UserService } from '../services/userService.js';

const router = express.Router();

// Get user profile
router.get('/profile/:userId', 
  validateParams(userIdParamSchema),
  async (req, res) => {
    try {
      const user = await UserService.getUserProfile(req.params.userId);
      res.json(createSuccessResponse(user));
    } catch (error) {
      console.error('User profile fetch error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json(createErrorResponse('User not found'));
      }
      res.status(500).json(createErrorResponse('Failed to fetch user profile'));
    }
  }
);

// Get current user profile (authenticated)
router.get('/me', 
  authMiddleware, 
  async (req, res) => {
    try {
      const user = await UserService.getUserProfile(req.user.id);
      res.json(createSuccessResponse(user));
    } catch (error) {
      console.error('Current user fetch error:', error);
      if (error.message === 'User not found') {
        return res.status(404).json(createErrorResponse('User not found'));
      }
      res.status(500).json(createErrorResponse('Failed to fetch profile'));
    }
  }
);

// Update user profile
router.put('/profile', 
  authMiddleware, 
  validateBody(updateProfileSchema),
  async (req, res) => {
    try {
      const updatedUser = await UserService.updateUserProfile(req.user.id, req.body);
      res.json(createSuccessResponse(updatedUser, 'Profile updated successfully'));
    } catch (error) {
      console.error('Profile update error:', error);
      if (error.message === 'Username already exists') {
        return res.status(400).json(createErrorResponse('Username already exists'));
      }
      res.status(500).json(createErrorResponse('Failed to update profile'));
    }
  }
);

// Get user's items
router.get('/:userId/items', 
  validateParams(userIdParamSchema),
  validateQuery(userItemsQuerySchema),
  async (req, res) => {
    try {
      const items = await UserService.getUserItems(req.params.userId, req.query);
      res.json(createSuccessResponse(items));
    } catch (error) {
      console.error('User items fetch error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch user items'));
    }
  }
);

// Get user's trade history
router.get('/:userId/trades', 
  validateParams(userIdParamSchema),
  validateQuery(paginationSchema),
  async (req, res) => {
    try {
      const result = await UserService.getUserTrades(req.params.userId, req.query);
      res.json(createSuccessResponse(result));
    } catch (error) {
      console.error('User trades fetch error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch trade history'));
    }
  }
);

// Get user's reviews
router.get('/:userId/reviews', 
  validateParams(userIdParamSchema),
  validateQuery(paginationSchema),
  async (req, res) => {
    try {
      const result = await UserService.getUserReviews(req.params.userId, req.query);
      res.json(createSuccessResponse(result));
    } catch (error) {
      console.error('User reviews fetch error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch reviews'));
    }
  }
);

// Get leaderboard
router.get('/leaderboard', 
  validateQuery(paginationSchema),
  async (req, res) => {
    try {
      const result = await UserService.getLeaderboard(req.query);
      res.json(createSuccessResponse(result));
    } catch (error) {
      console.error('Leaderboard fetch error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch leaderboard'));
    }
  }
);

// Search users
router.get('/search', 
  validateQuery(userSearchSchema),
  async (req, res) => {
    try {
      const users = await UserService.searchUsers(req.query);
      res.json(createSuccessResponse(users));
    } catch (error) {
      console.error('User search error:', error);
      if (error.message === 'Query must be at least 2 characters') {
        return res.status(400).json(createErrorResponse('Query must be at least 2 characters'));
      }
      res.status(500).json(createErrorResponse('Failed to search users'));
    }
  }
);

export default router;