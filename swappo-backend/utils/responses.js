// utils/responses.js

/**
 * Standard API Response Formats
 * Consistent response structure across all endpoints
 */

/**
 * Success Response Structure
 * @param {any} data - The response data
 * @param {string} message - Success message
 * @param {Object} meta - Additional metadata (pagination, stats, etc.)
 * @returns {Object} Formatted success response
 */
export const createSuccessResponse = (data = null, message = 'Operation successful', meta = null) => {
  const response = {
    success: true,
    status: 'success',
    message,
    timestamp: new Date().toISOString(),
    data
  };

  // Add metadata if provided (pagination, statistics, etc.)
  if (meta) {
    response.meta = meta;
  }

  return response;
};

/**
 * Error Response Structure
 * @param {string} message - Error message
 * @param {Array|Object} errors - Detailed error information
 * @param {number} statusCode - HTTP status code
 * @param {string} errorCode - Application-specific error code
 * @returns {Object} Formatted error response
 */
export const createErrorResponse = (
  message = 'An error occurred', 
  errors = null, 
  statusCode = 500,
  errorCode = null
) => {
  const response = {
    success: false,
    status: 'error',
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  // Add error code if provided
  if (errorCode) {
    response.errorCode = errorCode;
  }

  // Add detailed errors if provided
  if (errors) {
    response.errors = Array.isArray(errors) ? errors : [errors];
  }

  return response;
};

/**
 * Validation Error Response
 * @param {Array} validationErrors - Array of validation error objects
 * @param {string} message - Custom validation message
 * @returns {Object} Formatted validation error response
 */
export const createValidationErrorResponse = (
  validationErrors, 
  message = 'Validation failed'
) => {
  return createErrorResponse(
    message,
    validationErrors,
    400,
    'VALIDATION_ERROR'
  );
};

/**
 * Not Found Error Response
 * @param {string} resource - Name of the resource not found
 * @returns {Object} Formatted not found response
 */
export const createNotFoundResponse = (resource = 'Resource') => {
  return createErrorResponse(
    `${resource} not found`,
    null,
    404,
    'NOT_FOUND'
  );
};

/**
 * Unauthorized Error Response
 * @param {string} message - Custom unauthorized message
 * @returns {Object} Formatted unauthorized response
 */
export const createUnauthorizedResponse = (message = 'Authentication required') => {
  return createErrorResponse(
    message,
    null,
    401,
    'UNAUTHORIZED'
  );
};

/**
 * Forbidden Error Response
 * @param {string} message - Custom forbidden message
 * @returns {Object} Formatted forbidden response
 */
export const createForbiddenResponse = (message = 'Access denied') => {
  return createErrorResponse(
    message,
    null,
    403,
    'FORBIDDEN'
  );
};

/**
 * Conflict Error Response
 * @param {string} message - Custom conflict message
 * @returns {Object} Formatted conflict response
 */
export const createConflictResponse = (message = 'Resource already exists') => {
  return createErrorResponse(
    message,
    null,
    409,
    'CONFLICT'
  );
};

/**
 * Server Error Response
 * @param {string} message - Custom server error message
 * @param {Object} error - Original error object (for logging)
 * @returns {Object} Formatted server error response
 */
export const createServerErrorResponse = (
  message = 'Internal server error',
  error = null
) => {
  // Log the actual error for debugging
  if (error) {
    console.error('Server Error:', error);
  }

  return createErrorResponse(
    message,
    null,
    500,
    'SERVER_ERROR'
  );
};

/**
 * Paginated Response Helper
 * @param {Array} data - Array of items
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @param {string} message - Success message
 * @returns {Object} Formatted paginated response
 */
export const createPaginatedResponse = (
  data, 
  page, 
  limit, 
  total, 
  message = 'Data retrieved successfully'
) => {
  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total: parseInt(total),
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1
  };

  return createSuccessResponse(data, message, { pagination });
};

/**
 * File Upload Success Response
 * @param {Object} file - Uploaded file information
 * @param {string} message - Custom success message
 * @returns {Object} Formatted file upload response
 */
export const createFileUploadResponse = (
  file,
  message = 'File uploaded successfully'
) => {
  return createSuccessResponse({
    fileName: file.filename,
    originalName: file.originalname,
    size: file.size,
    mimeType: file.mimetype,
    path: file.path
  }, message);
};

/**
 * Bulk Operation Response
 * @param {number} successCount - Number of successful operations
 * @param {number} failureCount - Number of failed operations
 * @param {Array} errors - Array of error details for failed operations
 * @param {string} operation - Name of the bulk operation
 * @returns {Object} Formatted bulk operation response
 */
export const createBulkOperationResponse = (
  successCount,
  failureCount,
  errors = [],
  operation = 'bulk operation'
) => {
  const data = {
    summary: {
      total: successCount + failureCount,
      successful: successCount,
      failed: failureCount
    }
  };

  if (errors.length > 0) {
    data.failures = errors;
  }

  const message = failureCount === 0 
    ? `${operation} completed successfully`
    : `${operation} completed with ${failureCount} failures`;

  return createSuccessResponse(data, message);
};

/**
 * Standard Error Messages
 */
export const ERROR_MESSAGES = {
  // Authentication & Authorization
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  INVALID_CREDENTIALS: 'Invalid email or password',
  TOKEN_EXPIRED: 'Authentication token has expired',
  INVALID_TOKEN: 'Invalid authentication token',

  // Validation
  VALIDATION_FAILED: 'Validation failed',
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
  INVALID_EMAIL: 'Invalid email address',
  INVALID_PHONE: 'Invalid phone number',

  // Resources
  NOT_FOUND: 'Resource not found',
  ALREADY_EXISTS: 'Resource already exists',
  CANNOT_DELETE: 'Cannot delete this resource',
  CANNOT_UPDATE: 'Cannot update this resource',

  // Operations
  OPERATION_FAILED: 'Operation failed',
  SERVER_ERROR: 'Internal server error',
  DATABASE_ERROR: 'Database operation failed',
  FILE_UPLOAD_FAILED: 'File upload failed',

  // Business Logic
  INSUFFICIENT_PERMISSIONS: 'Insufficient permissions',
  RESOURCE_LIMIT_EXCEEDED: 'Resource limit exceeded',
  OPERATION_NOT_ALLOWED: 'Operation not allowed',
  
  // Items
  ITEM_NOT_AVAILABLE: 'Item is not available',
  ITEM_ALREADY_RESERVED: 'Item is already reserved',
  
  // Trades
  TRADE_NOT_PENDING: 'Trade is not in pending status',
  CANNOT_TRADE_OWN_ITEM: 'Cannot trade with your own item',
  TRADE_ALREADY_EXISTS: 'Trade request already exists',

  // Users
  USERNAME_TAKEN: 'Username is already taken',
  EMAIL_TAKEN: 'Email is already registered',
  USER_NOT_ACTIVE: 'User account is not active'
};

/**
 * Standard Success Messages
 */
export const SUCCESS_MESSAGES = {
  // General Operations
  CREATED: 'Created successfully',
  UPDATED: 'Updated successfully',
  DELETED: 'Deleted successfully',
  RETRIEVED: 'Retrieved successfully',

  // Authentication
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  REGISTRATION_SUCCESS: 'Registration successful',
  PASSWORD_CHANGED: 'Password changed successfully',

  // Items
  ITEM_CREATED: 'Item created successfully',
  ITEM_UPDATED: 'Item updated successfully',
  ITEM_DELETED: 'Item deleted successfully',
  ITEM_STATUS_UPDATED: 'Item status updated successfully',

  // Trades
  TRADE_REQUEST_CREATED: 'Trade request created successfully',
  TRADE_ACCEPTED: 'Trade request accepted successfully',
  TRADE_REJECTED: 'Trade request rejected successfully',
  TRADE_COMPLETED: 'Trade completed successfully',
  TRADE_CANCELLED: 'Trade cancelled successfully',

  // Users
  PROFILE_UPDATED: 'Profile updated successfully',
  ACCOUNT_ACTIVATED: 'Account activated successfully',

  // Ratings
  RATING_CREATED: 'Rating created successfully',
  RATING_UPDATED: 'Rating updated successfully',
  RATING_DELETED: 'Rating deleted successfully'
};
