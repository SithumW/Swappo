
// routes/items.js
import express from 'express';
import multer from 'multer';
import path from 'path';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Import validation middleware and schemas
import { 
  validateBody, 
  validateParams, 
  validateQuery, 
  validateFiles,
  validateAuth,
  createSuccessResponse,
  createErrorResponse,
  createServerErrorResponse,
  createNotFoundResponse,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES
} from '../validation/validationMiddleware.js';

import {
  createItemSchema,
  updateItemSchema,
  itemQuerySchema,
  statusUpdateSchema,
  itemParamsSchema
} from '../validation/itemValidation.js';

// Import service layer
import { ItemService } from '../services/itemService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'items');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Get all items (marketplace)
router.get('/', 
  optionalAuthMiddleware,
  async (req, res) => {
    try {
      const result = await ItemService.getAllItems(req.user?.id);
      res.json(createSuccessResponse(result, SUCCESS_MESSAGES.RETRIEVED));
    } catch (error) {
      console.error('Items fetch error:', error);
      res.status(500).json(createServerErrorResponse(ERROR_MESSAGES.OPERATION_FAILED, error));
    }
  }
);

// Get single item with trade requests
router.get('/:itemId', 
  optionalAuthMiddleware,
  validateParams(itemParamsSchema),
  async (req, res) => {
    try {
      const item = await ItemService.getItemById(req.params.itemId, req.user?.id);
      res.json(createSuccessResponse(item, SUCCESS_MESSAGES.RETRIEVED));
    } catch (error) {
      console.error('Item fetch error:', error);
      if (error.message === 'Item not found') {
        return res.status(404).json(createNotFoundResponse('Item'));
      }
      res.status(500).json(createServerErrorResponse(ERROR_MESSAGES.OPERATION_FAILED, error));
    }
  }
);

// Create new item
router.post('/', 
  authMiddleware,
  upload.array('images', 5),
  validateFiles({ maxFiles: 5, required: false }),
  validateBody(createItemSchema),
  (req, res, next) => {
    console.log('Item creation request:', req.body);
    next();
  },
  async (req, res) => {
    try {
      const itemData = {
        ...req.body,
        images: req.files || []
      };
      
      const item = await ItemService.createItem(itemData, req.user.id);
      res.status(201).json(createSuccessResponse(item, SUCCESS_MESSAGES.ITEM_CREATED));
    } catch (error) {
      console.error('Item creation error:', error);
      res.status(500).json(createServerErrorResponse(ERROR_MESSAGES.OPERATION_FAILED, error));
    }
  }
);

// Update item
router.put('/:itemId', 
  authMiddleware,
  validateParams(itemParamsSchema),
  upload.array('newImages', 5),
  validateFiles({ maxFiles: 5, required: false }),
  validateBody(updateItemSchema),
  async (req, res) => {
    try {
      const updateData = {
        ...req.body,
        newImages: req.files || []
      };
      
      const item = await ItemService.updateItem(req.params.itemId, updateData, req.user.id);
      res.json(createSuccessResponse(item, SUCCESS_MESSAGES.ITEM_UPDATED));
    } catch (error) {
      console.error('Item update error:', error);
      if (error.message === 'Item not found or access denied') {
        return res.status(404).json(createNotFoundResponse('Item'));
      }
      res.status(500).json(createServerErrorResponse(ERROR_MESSAGES.OPERATION_FAILED, error));
    }
  }
);

// Delete item
router.delete('/:itemId', 
  authMiddleware,
  validateParams(itemParamsSchema),
  async (req, res) => {
    try {
      await ItemService.deleteItem(req.params.itemId, req.user.id);
      res.json(createSuccessResponse(null, SUCCESS_MESSAGES.ITEM_DELETED));
    } catch (error) {
      console.error('Item deletion error:', error);
      if (error.message === 'Item not found or access denied') {
        return res.status(404).json(createNotFoundResponse('Item'));
      }
      if (error.message === 'Cannot delete item with pending trade requests') {
        return res.status(400).json(createErrorResponse(ERROR_MESSAGES.CANNOT_DELETE));
      }
      res.status(500).json(createServerErrorResponse(ERROR_MESSAGES.OPERATION_FAILED, error));
    }
  }
);

// Get categories (for dropdown/filter)
router.get('/meta/categories', async (req, res) => {
  try {
    const categories = await ItemService.getCategories();
    res.json(createSuccessResponse(categories, SUCCESS_MESSAGES.RETRIEVED));
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json(createServerErrorResponse(ERROR_MESSAGES.OPERATION_FAILED, error));
  }
});

// Toggle item status (available/removed)
router.patch('/:itemId/status', 
  authMiddleware,
  validateParams(itemParamsSchema),
  validateBody(statusUpdateSchema),
  async (req, res) => {
    try {
      const item = await ItemService.updateItemStatus(req.params.itemId, req.body.status, req.user.id);
      res.json(createSuccessResponse(item, SUCCESS_MESSAGES.ITEM_STATUS_UPDATED));
    } catch (error) {
      console.error('Status update error:', error);
      if (error.message === 'Item not found or access denied') {
        return res.status(404).json(createNotFoundResponse('Item'));
      }
      res.status(500).json(createServerErrorResponse(ERROR_MESSAGES.OPERATION_FAILED, error));
    }
  }
);

// Get items by user ID
router.get('/user/:userId', 
  optionalAuthMiddleware,
  async (req, res) => {
    try {
      const result = await ItemService.getItemsByUser(req.params.userId);
      res.json(createSuccessResponse(result, SUCCESS_MESSAGES.RETRIEVED));
    } catch (error) {
      console.error('User items fetch error:', error);
      res.status(500).json(createServerErrorResponse(ERROR_MESSAGES.OPERATION_FAILED, error));
    }
  }
);

export default router;