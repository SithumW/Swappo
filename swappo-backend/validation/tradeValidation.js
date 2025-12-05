// validation/tradeValidation.js
import Joi from 'joi';

// Validation schema for creating a trade request
export const createTradeRequestSchema = Joi.object({
  requested_item_id: Joi.string()
    .required()
    .messages({
      'string.empty': 'Requested item ID is required',
      'any.required': 'Requested item ID is required'
    }),
  
  offered_item_id: Joi.string()
    .required()
    .messages({
      'string.empty': 'Offered item ID is required',
      'any.required': 'Offered item ID is required'
    }),
  
  message: Joi.string()
    .trim()
    .max(500)
    .optional()
    .messages({
      'string.max': 'Message cannot exceed 500 characters'
    })
}).custom((value, helpers) => {
  // Ensure user is not trading with themselves
  if (value.requested_item_id === value.offered_item_id) {
    return helpers.error('trade.sameItem');
  }
  return value;
}).messages({
  'trade.sameItem': 'Cannot trade the same item'
});

// Validation schema for trade request ID parameter
export const tradeRequestIdSchema = Joi.object({
  requestId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Trade request ID is required',
      'any.required': 'Trade request ID is required'
    })
});

// Validation schema for trade ID parameter
export const tradeIdSchema = Joi.object({
  tradeId: Joi.string()
    .required()
    .messages({
      'string.empty': 'Trade ID is required',
      'any.required': 'Trade ID is required'
    })
});

// Validation schema for trade status update
export const updateTradeStatusSchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED')
    .required()
    .messages({
      'any.only': 'Status must be one of: PENDING, ACCEPTED, REJECTED, COMPLETED, CANCELLED',
      'any.required': 'Status is required'
    })
});

// Validation schema for trade completion
export const completeTradeSchema = Joi.object({
  confirmation: Joi.boolean()
    .truthy()
    .required()
    .messages({
      'any.required': 'Confirmation is required',
      'boolean.base': 'Confirmation must be true'
    })
});

// Validation schema for trade query parameters
export const tradeQuerySchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED')
    .optional(),
  
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});

// Alias for createTradeRequestSchema to match route imports
export const createTradeSchema = createTradeRequestSchema;

// Alias for updateTradeStatusSchema to match route imports  
export const tradeStatusSchema = updateTradeStatusSchema;

// Schema for user trades query parameters
export const userTradesQuerySchema = Joi.object({
  status: Joi.string()
    .valid('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED')
    .optional(),
  
  type: Joi.string()
    .valid('as_requester', 'as_owner', 'all')
    .optional(),
  
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20)
});
