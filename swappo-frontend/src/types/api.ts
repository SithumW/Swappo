// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  status: string;
  message: string;
  data?: T;
  timestamp: string;
  statusCode?: number;
}

export interface ApiError {
  success: false;
  status: 'error';
  message: string;
  errorCode: string;
  timestamp: string;
  statusCode: number;
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
}

// User Types
export type Badge = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND' | 'RUBY';

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  latitude?: number;
  longitude?: number;
  bio?: string;
  loyalty_points: number;
  badge: Badge;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
    trades: number;
    reviews: number;
  };
}

export interface UserProfile extends User {
  _count: {
    items: number;
    trades: number;
    reviews: number;
  };
}

// Auth Types
export interface AuthRequest {
  email: string;
  password: string;
  name?: string; // Only for registration
}

export interface AuthResponse {
  user: User;
  session: {
    token: string;
    expiresAt: string;
  };
}

// Better-Auth specific response (different from our API format)
export interface BetterAuthResponse {
  user: User;
  token: string;
  redirect: boolean;
}

// Item Types
export type ItemCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
export type ItemStatus = 'AVAILABLE' | 'RESERVED' | 'SWAPPED' | 'REMOVED';

export interface ItemImage {
  id: string;
  item_id: string;
  url: string;
}

export interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  condition: ItemCondition;
  status: ItemStatus;
  latitude?: number;
  longitude?: number;
  phone_number: string;
  whatsapp_number?: string;
  posted_at: string;
  images: ItemImage[];
  user: User;
  _count?: {
    trade_requests_for: number;
  };
}

export interface ItemCreateRequest {
  title: string;
  description: string;
  category: string;
  condition: ItemCondition;
  latitude?: number;
  longitude?: number;
  phone_number: string;
  whatsapp_number?: string;
  // images will be handled as FormData
}

export interface ItemUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
  condition?: ItemCondition;
  latitude?: number;
  longitude?: number;
  phone_number?: string;
  whatsapp_number?: string;
  removeImageIds?: string;
  // newImages will be handled as FormData
}

export interface ItemsQuery {
  category?: string;
  condition?: ItemCondition;
  latitude?: number;
  longitude?: number;
  search?: string;
  exclude_user?: string;
}

// Trade Types
export type TradeRequestStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
export type TradeStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface TradeRequest {
  trade: {
    status: string;
    owner_id?: string;
    requester_id?: string;
    id?: string;
    completed_at?: string;
    created_at?: string;
  };
  id: string;
  requested_item_id: string;
  offered_item_id: string;
  requester_id: string;
  status: TradeRequestStatus;
  requested_at: string;
  requested_item: Item;
  offered_item: Item;
  requester: User;
  owner?: User; // Added for trades that have been accepted
}

export interface Trade {
  id: string;
  trade_request_id: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  created_at: string;
  completed_at?: string;
  
  // Core trade participants (from backend)
  owner_id?: string;
  requester_id?: string;
  owner?: User;
  requester?: User;
  
  // Item data
  requested_item?: Item;
  offered_item?: Item;
  
  // The actual structure includes trade_request, not trade_requests array
  trade_request?: {
    id: string;
    requested_at: string;
    offered_item: {
      id: string;
      title: string;
      condition: string;
      images: ItemImage[];
      user_id: string;
    };
    requested_item: {
      id: string;
      title: string;
      condition: string;
      images: ItemImage[];
      user_id: string;
    };
    requester: User;
  };
  
  // Legacy support for existing code
  trade_requests?: Array<{
    id: string;
    offered_item: Item;
    requested_item: Item;
    requester: User;
  }>;
}

export interface TradeRequestCreate {
  requested_item_id: string;
  offered_item_id: string;
}

// Rating Types
export interface Rating {
  rater_id: string;
  id: string;
  trade_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number; // 1-5
  comment?: string;
  created_at: string;
  trade: Trade;
  reviewer: User;
  reviewee: User;
}

export interface RatingCreate {
  trade_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string | null;
}

export interface RatingStats {
  received: {
    average: number;
    total: number;
    min: number;
    max: number;
    distribution: Array<{
      rating: number;
      count: number;
    }>;
  };
  given: {
    average: number;
    total: number;
  };
}

// PIN Verification Types
export interface PinResponse {
  success: boolean;
  pin?: string;
  expiresAt?: string;
  message: string;
}

export interface PinStatus {
  exists: boolean;
  isVerified?: boolean;
  isExpired?: boolean;
  expiresAt?: string;
  userRole?: 'requester' | 'receiver';
  message?: string;
}

export interface PinDetails {
  success: boolean;
  pin?: string;
  expiresAt?: string;
  isVerified?: boolean;
  verifiedAt?: string;
  canEnterPin?: boolean;
}

export interface PinVerificationRequest {
  pin: string;
}

export interface PinVerificationResponse {
  success: boolean;
  message: string;
}

// Search and Pagination Types
export interface SearchQuery {
  q: string;
  latitude?: number;
  longitude?: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
