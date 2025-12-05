// validation/itemValidation.js
import Joi from 'joi';

// Validation schema for creating a new item
export const createItemSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters',
      'any.required': 'Title is required'
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Description is required',
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 1000 characters',
      'any.required': 'Description is required'
    }),
  
  category: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Category is required',
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category cannot exceed 50 characters',
      'any.required': 'Category is required'
    }),
  
  condition: Joi.string()
    .valid('NEW', 'GOOD', 'FAIR', 'POOR')
    .required()
    .messages({
      'any.only': 'Condition must be one of: NEW, GOOD, FAIR, POOR',
      'any.required': 'Condition is required'
    }),

  phone_number: Joi.string()
    .trim()
    .pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .required()
    .messages({
      'string.empty': 'Phone number is required',
      'string.pattern.base': 'Please enter a valid phone number (10-15 digits)',
      'any.required': 'Phone number is required'
    }),

  whatsapp_number: Joi.string()
    .trim()
    .pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid WhatsApp number (10-15 digits)'
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
});

// Validation schema for updating an item
export const updateItemSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Title must be at least 3 characters long',
      'string.max': 'Title cannot exceed 100 characters'
    }),
  
  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .optional()
    .messages({
      'string.min': 'Description must be at least 10 characters long',
      'string.max': 'Description cannot exceed 1000 characters'
    }),
  
  category: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Category must be at least 2 characters long',
      'string.max': 'Category cannot exceed 50 characters'
    }),
  
  condition: Joi.string()
    .valid('NEW', 'GOOD', 'FAIR', 'POOR')
    .optional()
    .messages({
      'any.only': 'Condition must be one of: NEW, GOOD, FAIR, POOR'
    }),

  phone_number: Joi.string()
    .trim()
    .pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .optional()
    .messages({
      'string.pattern.base': 'Please enter a valid phone number (10-15 digits)'
    }),

  whatsapp_number: Joi.string()
    .trim()
    .pattern(/^[\+]?[0-9\s\-\(\)]{10,15}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please enter a valid WhatsApp number (10-15 digits)'
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
    }),
  
  removeImageIds: Joi.string()
    .optional()
    .custom((value, helpers) => {
      try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) {
          return helpers.error('array.base');
        }
        return parsed;
      } catch (error) {
        return helpers.error('string.json');
      }
    })
    .messages({
      'array.base': 'removeImageIds must be an array',
      'string.json': 'removeImageIds must be valid JSON array'
    })
}).min(1).messages({
  'object.min': 'At least one field must be provided for update'
});

// Validation schema for item status update
export const updateItemStatusSchema = Joi.object({
  status: Joi.string()
    .valid('AVAILABLE', 'UNAVAILABLE', 'TRADED')
    .required()
    .messages({
      'any.only': 'Status must be one of: AVAILABLE, UNAVAILABLE, TRADED',
      'any.required': 'Status is required'
    })
});

// Validation schema for item query parameters
export const itemQuerySchema = Joi.object({
  category: Joi.string().trim().optional(),
  condition: Joi.string().valid('NEW', 'GOOD', 'FAIR', 'POOR').optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  search: Joi.string().trim().min(1).max(100).optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  exclude_user: Joi.string().optional()
});

// Validation schema for item ID parameter
export const itemParamsSchema = Joi.object({
  itemId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Item ID is required',
      'string.uuid': 'Item ID must be a valid UUID',
      'any.required': 'Item ID is required'
    })
});

// Validation schema for status update
export const statusUpdateSchema = Joi.object({
  status: Joi.string()
    .valid('AVAILABLE', 'REMOVED')
    .required()
    .messages({
      'any.only': 'Status must be either AVAILABLE or REMOVED',
      'any.required': 'Status is required'
    })
});

// File validation for images
export const validateImages = (files) => {
  if (!files || files.length === 0) {
    return { isValid: true }; // Images are optional
  }

  if (files.length > 5) {
    return { 
      isValid: false, 
      error: 'Maximum 5 images are allowed' 
    };
  }

  for (const file of files) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return { 
        isValid: false, 
        error: `File ${file.originalname} is too large. Maximum size is 5MB` 
      };
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      return { 
        isValid: false, 
        error: `File ${file.originalname} has invalid type. Only JPEG, PNG, and WebP are allowed` 
      };
    }
  }

  return { isValid: true };
};
