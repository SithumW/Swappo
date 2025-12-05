// validation/ratingValidation.js
import Joi from 'joi';

// Validation schema for creating a rating
export const createRatingSchema = Joi.object({
  reviewee_id: Joi.string()
    .required()
    .messages({
      'string.empty': 'Rated user ID is required',
      'any.required': 'Rated user ID is required'
    }),
  
  trade_id: Joi.string()
    .optional()
    .messages({
      'string.empty': 'Trade ID must be a valid string if provided'
    }),
  
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be a whole number',
      'number.min': 'Rating must be at least 1 star',
      'number.max': 'Rating cannot exceed 5 stars',
      'any.required': 'Rating is required'
    }),
  
  comment: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Comment cannot exceed 500 characters'
    })
}).custom((value, helpers) => {
  // Add custom validation to prevent self-rating
  // This will be handled in the service layer with user context
  return value;
});

// Validation schema for updating a rating
export const updateRatingSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional()
    .messages({
      'number.base': 'Rating must be a number',
      'number.integer': 'Rating must be a whole number',
      'number.min': 'Rating must be at least 1 star',
      'number.max': 'Rating cannot exceed 5 stars'
    }),
  
  comment: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Comment cannot exceed 500 characters'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for rating ID parameter
export const ratingIdSchema = Joi.object({
  ratingId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Rating ID is required',
      'any.required': 'Rating ID is required'
    })
});

// Validation schema for getting user ratings
export const userRatingsQuerySchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    }),
  
  type: Joi.string()
    .valid('given', 'received')
    .default('received')
    .messages({
      'any.only': 'Type must be either "given" or "received"'
    }),
  
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

// Validation schema for rating statistics query
export const ratingStatsQuerySchema = Joi.object({
  type: Joi.string()
    .valid('given', 'received')
    .default('received')
    .messages({
      'any.only': 'Type must be either "given" or "received"'
    })
});
