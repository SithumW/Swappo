// Export all API services for easy importing
export { default as userService } from './userService';
export { default as itemService } from './itemService';
export { default as tradeService } from './tradeService';
export { default as ratingService } from './ratingService';

// Import services for bulk export
import userService from './userService';
import itemService from './itemService';
import tradeService from './tradeService';
import ratingService from './ratingService';

// Re-export types
export type { Item, ItemImage, ItemCreateData, ItemUpdateData, ItemFilters } from './itemService';
export type { TradeRequest, Trade, TradeRequestCreate } from './tradeService';
export type { Rating, RatingCreate, RatingUpdate, RatingStats } from './ratingService';

// Export the main services object for bulk imports
export const apiServices = {
  user: userService,
  item: itemService,
  trade: tradeService,
  rating: ratingService,
} as const;
