// routes/ratings.js
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
  userIdParamSchema,
  paginationSchema
} from '../validation/validationMiddleware.js';

import {
  createRatingSchema,
  updateRatingSchema,
  ratingStatsQuerySchema
} from '../validation/ratingValidation.js';

// Import service layer
import { RatingService } from '../services/ratingService.js';

const router = express.Router();

// Create a new rating
router.post('/', 
  authMiddleware,
  validateBody(createRatingSchema),
  async (req, res) => {
    try {
      const rating = await RatingService.createRating(req.body, req.user.id);
      res.status(201).json(createSuccessResponse(rating, 'Rating created successfully'));
    } catch (error) {
      console.error('Rating creation error:', error);
      const statusCode = getErrorStatusCode(error.message);
      res.status(statusCode).json(createErrorResponse(error.message));
    }
  }
);

// Update a rating
router.put('/:ratingId', 
  authMiddleware,
  validateParams(idParamSchema),
  validateBody(updateRatingSchema),
  async (req, res) => {
    try {
      const rating = await RatingService.updateRating(req.params.id, req.user.id, req.body);
      res.json(createSuccessResponse(rating, 'Rating updated successfully'));
    } catch (error) {
      console.error('Rating update error:', error);
      const statusCode = getErrorStatusCode(error.message);
      res.status(statusCode).json(createErrorResponse(error.message));
    }
  }
);

// Delete a rating
router.delete('/:ratingId', 
  authMiddleware,
  validateParams(idParamSchema),
  async (req, res) => {
    try {
      const result = await RatingService.deleteRating(req.params.id, req.user.id);
      res.json(createSuccessResponse(result));
    } catch (error) {
      console.error('Rating deletion error:', error);
      const statusCode = getErrorStatusCode(error.message);
      res.status(statusCode).json(createErrorResponse(error.message));
    }
  }
);

// Get ratings for a user (received by default)
router.get('/user/:userId', 
  validateParams(userIdParamSchema),
  async (req, res) => {
    try {
      const result = await RatingService.getUserRatings(req.params.userId, 'received');
      res.json(createSuccessResponse(result));
    } catch (error) {
      console.error('User ratings fetch error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch user ratings'));
    }
  }
);

// Get rating statistics for a user
router.get('/user/:userId/stats', 
  validateParams(userIdParamSchema),
  async (req, res) => {
    try {
      const stats = await RatingService.getUserRatingStats(req.params.userId);
      res.json(createSuccessResponse(stats));
    } catch (error) {
      console.error('Rating stats fetch error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch rating statistics'));
    }
  }
);

// Get pending ratings (trades that can be rated by current user)
router.get('/pending', 
  authMiddleware,
  validateQuery(paginationSchema),
  async (req, res) => {
    try {
      const result = await RatingService.getPendingRatings(req.user.id, req.query);
      res.json(createSuccessResponse(result));
    } catch (error) {
      console.error('Pending ratings fetch error:', error);
      res.status(500).json(createErrorResponse('Failed to fetch pending ratings'));
    }
  }
);

// Helper function to determine status code from error message
function getErrorStatusCode(errorMessage) {
  if (errorMessage.includes('not found')) return 404;
  if (errorMessage.includes('cannot rate yourself') || 
      errorMessage.includes('can only rate') ||
      errorMessage.includes('can only update') ||
      errorMessage.includes('can only delete')) return 403;
  if (errorMessage.includes('already rated') || 
      errorMessage.includes('only rate users from completed') ||
      errorMessage.includes('must be completed')) return 400;
  return 500;
}

export default router;