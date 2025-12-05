// validation/userValidation.js
import Joi from 'joi';

// Validation schema for user profile update
export const updateProfileSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 50 characters'
    }),
  
  email: Joi.string()
    .email()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  
  bio: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Bio cannot exceed 500 characters'
    }),
  
  latitude: Joi.number()
    .min(-90)
    .max(90)
    .optional()
    .messages({
      'number.min': 'Latitude must be between -90 and 90',
      'number.max': 'Latitude must be between -90 and 90'
    }),

  longitude: Joi.number()
    .min(-180)
    .max(180)
    .optional()
    .messages({
      'number.min': 'Longitude must be between -180 and 180',
      'number.max': 'Longitude must be between -180 and 180'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for user search query
export const userSearchSchema = Joi.object({
  query: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Search query is required',
      'string.min': 'Search query must be at least 2 characters long',
      'string.max': 'Search query cannot exceed 50 characters',
      'any.required': 'Search query is required'
    }),
  
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

// Validation schema for user ID parameter
export const userIdSchema = Joi.object({
  userId: Joi.string()
    .required()
    .messages({
      'string.empty': 'User ID is required',
      'any.required': 'User ID is required'
    })
});

// Validation schema for pagination
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// Validation schema for user items query parameters
export const userItemsQuerySchema = Joi.object({
  status: Joi.string()
    .valid('AVAILABLE', 'RESERVED', 'SWAPPED', 'REMOVED', 'ALL')
    .default('AVAILABLE')
    .messages({
      'any.only': 'Status must be one of: AVAILABLE, RESERVED, SWAPPED, REMOVED, ALL'
    }),
  
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  
  sortBy: Joi.string()
    .valid('posted_at', 'title', 'category')
    .default('posted_at')
    .messages({
      'any.only': 'Sort by must be one of: posted_at, title, category'
    }),
  
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .default('desc')
    .messages({
      'any.only': 'Sort order must be either asc or desc'
    })
});
