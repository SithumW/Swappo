// validation/validationMiddleware.js
import Joi from 'joi';
import { 
  createErrorResponse, 
  createValidationErrorResponse,
  createUnauthorizedResponse,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES 
} from '../utils/responses.js';

/**
 * Validation middleware factory
 * Creates middleware functions for different validation targets
 */

/**
 * Generic validation middleware factory
 * @param {Object} schema - Joi validation schema
 * @param {string} property - Property to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware function
 */
export const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // Show all validation errors
      allowUnknown: false, // Don't allow unknown fields
      stripUnknown: true, // Remove unknown fields
      convert: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json(createValidationErrorResponse(errors));
    }

    // Replace the original property with the validated and sanitized value
    req[property] = value;
    next();
  };
};

export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json(createValidationErrorResponse(validationErrors));
    }

    req.body = value;
    next();
  };
};

export const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json(createValidationErrorResponse(validationErrors, 'Invalid parameters'));
    }

    req.params = value;
    next();
  };
};

export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json(createValidationErrorResponse(validationErrors, 'Invalid query parameters'));
    }

    req.query = value;
    next();
  };
};

/**
 * Middleware for validating multiple properties at once
 */
export const validateMultiple = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Validate each specified property
    for (const [property, schema] of Object.entries(schemas)) {
      const { error, value } = schema.validate(req[property], {
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true,
        convert: true
      });

      if (error) {
        const propertyErrors = error.details.map(detail => ({
          property,
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }));
        errors.push(...propertyErrors);
      } else {
        req[property] = value;
      }
    }

    if (errors.length > 0) {
      return res.status(400).json(createValidationErrorResponse(errors));
    }

    next();
  };
};

/**
 * File validation middleware for multer uploads
 */
export const validateFiles = (options = {}) => {
  const {
    maxFiles = 5,
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
    required = false
  } = options;

  return (req, res, next) => {
    const files = req.files || [];

    // Check if files are required
    if (required && files.length === 0) {
      return res.status(400).json(createValidationErrorResponse(
        [{ field: 'files', message: 'At least one file is required' }],
        'At least one file is required'
      ));
    }

    // Check number of files
    if (files.length > maxFiles) {
      return res.status(400).json(createValidationErrorResponse(
        [{ field: 'files', message: `Maximum ${maxFiles} files allowed` }],
        `Maximum ${maxFiles} files allowed`
      ));
    }

    // Validate each file
    for (const file of files) {
      // Check file size
      if (file.size > maxSize) {
        return res.status(400).json(createValidationErrorResponse(
          [{ field: 'files', message: `File too large: ${file.originalname}` }],
          `File ${file.originalname} is too large. Maximum size is ${maxSize / (1024 * 1024)}MB`
        ));
      }

      // Check file type
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json(createValidationErrorResponse(
          [{ field: 'files', message: `Invalid file type: ${file.originalname}` }],
          `File ${file.originalname} has invalid type. Allowed types: ${allowedTypes.join(', ')}`
        ));
      }
    }

    next();
  };
};

/**
 * Authentication validation middleware
 */
export const validateAuth = (req, res, next) => {
  if (!req.user || !req.user.id) {
    return res.status(401).json(createUnauthorizedResponse());
  }
  next();
};

/**
 * Common validation schemas
 */
export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10)
});

export const idParamSchema = Joi.object({
  requestId: Joi.string().required()
});

export const tradeIdParamSchema = Joi.object({
  tradeId: Joi.string().required()
});

export const userIdParamSchema = Joi.object({
  userId: Joi.string().required()
});

// Re-export response utilities for convenience
export {
  createSuccessResponse,
  createErrorResponse,
  createValidationErrorResponse,
  createNotFoundResponse,
  createUnauthorizedResponse,
  createForbiddenResponse,
  createConflictResponse,
  createServerErrorResponse,
  createPaginatedResponse,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES
} from '../utils/responses.js';
