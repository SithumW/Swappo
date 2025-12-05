// middleware/validation.js
import { ITEM_CATEGORIES, ITEM_CONDITIONS } from '../utils/helpers.js';

export function validateItemInput(req, res, next) {
  const { title, description, category, condition, phone_number, whatsapp_number } = req.body;
  
  if (!title || title.trim().length < 3) {
    return res.status(400).json({ error: 'Title must be at least 3 characters' });
  }
  
  if (!description || description.trim().length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters' });
  }
  
  if (!category || !ITEM_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: 'Valid category is required' });
  }
  
  if (!condition || !ITEM_CONDITIONS.includes(condition)) {
    return res.status(400).json({ error: 'Valid condition is required' });
  }
  
  // Phone number is required
  if (!phone_number || !phone_number.trim()) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  
  // Validate phone number format (basic validation for international numbers)
  const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,15}$/;
  if (!phoneRegex.test(phone_number.trim())) {
    return res.status(400).json({ error: 'Please enter a valid phone number (10-15 digits)' });
  }
  
  // WhatsApp number is optional, but if provided, validate format
  if (whatsapp_number && whatsapp_number.trim()) {
    if (!phoneRegex.test(whatsapp_number.trim())) {
      return res.status(400).json({ error: 'Please enter a valid WhatsApp number (10-15 digits)' });
    }
  }
  
  next();
}

export function validateTradeRequest(req, res, next) {
  const { requested_item_id, offered_item_id } = req.body;
  
  if (!requested_item_id || !offered_item_id) {
    return res.status(400).json({ 
      error: 'Both requested and offered item IDs are required' 
    });
  }
  
  if (requested_item_id === offered_item_id) {
    return res.status(400).json({ 
      error: 'Cannot trade an item for itself' 
    });
  }
  
  next();
}