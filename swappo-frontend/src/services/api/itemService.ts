import { apiClient } from '../api';
import { ApiResponse } from '@/types/api';

// Item types based on your API documentation
interface Item {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  status: 'AVAILABLE' | 'RESERVED' | 'SWAPPED' | 'REMOVED';
  latitude?: number;
  longitude?: number;
  posted_at: string;
  images: ItemImage[];
  user: any; // User details
  _count: {
    trade_requests_for: number;
  };
}

interface ItemImage {
  id: string;
  item_id: string;
  url: string;
}

interface ItemCreateData {
  title: string;
  description: string;
  category: string;
  condition: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  latitude?: number;
  longitude?: number;
  images?: File[];
}

interface ItemUpdateData {
  title?: string;
  description?: string;
  category?: string;
  condition?: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  latitude?: number;
  longitude?: number;
  newImages?: File[];
  removeImageIds?: string[];
}

interface ItemFilters {
  category?: string;
  condition?: 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
  latitude?: number;
  longitude?: number;
  search?: string;
  exclude_user?: string;
}

class ItemService {
  // Get all items with optional filters
  async getItems(filters?: ItemFilters): Promise<Item[]> {
    const response = await apiClient.get<Item[]>('/items', filters);
    return response.data;
  }

  // Get single item by ID
  async getItem(itemId: string): Promise<Item> {
    const response = await apiClient.get<Item>(`/items/${itemId}`);
    return response.data;
  }

  // Create new item
  async createItem(data: ItemCreateData): Promise<Item> {
    const formData = new FormData();
    
    // Add text fields
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('condition', data.condition);
    
    // Add optional fields
    if (data.latitude !== undefined) {
      formData.append('latitude', data.latitude.toString());
    }
    if (data.longitude !== undefined) {
      formData.append('longitude', data.longitude.toString());
    }
    
    // Add images
    if (data.images && data.images.length > 0) {
      data.images.forEach((image, index) => {
        formData.append('images', image);
      });
    }

    const response = await apiClient.uploadFile<Item>('/items', formData);
    return response.data;
  }

  // Update item
  async updateItem(itemId: string, data: ItemUpdateData): Promise<Item> {
    const formData = new FormData();
    
    // Add text fields if provided
    if (data.title !== undefined) formData.append('title', data.title);
    if (data.description !== undefined) formData.append('description', data.description);
    if (data.category !== undefined) formData.append('category', data.category);
    if (data.condition !== undefined) formData.append('condition', data.condition);
    if (data.latitude !== undefined) formData.append('latitude', data.latitude.toString());
    if (data.longitude !== undefined) formData.append('longitude', data.longitude.toString());
    
    // Add new images
    if (data.newImages && data.newImages.length > 0) {
      data.newImages.forEach((image) => {
        formData.append('newImages', image);
      });
    }
    
    // Add image IDs to remove
    if (data.removeImageIds && data.removeImageIds.length > 0) {
      formData.append('removeImageIds', data.removeImageIds.join(','));
    }

    const response = await apiClient.uploadFile<Item>(`/items/${itemId}`, formData);
    return response.data;
  }

  // Delete item
  async deleteItem(itemId: string): Promise<void> {
    await apiClient.delete(`/items/${itemId}`);
  }

  // Update item status
  async updateItemStatus(itemId: string, status: 'AVAILABLE' | 'REMOVED'): Promise<Item> {
    const response = await apiClient.put<Item>(`/items/${itemId}/status`, { status });
    return response.data;
  }

  // Search items by text
  async searchItems(searchTerm: string, filters?: Omit<ItemFilters, 'search'>): Promise<Item[]> {
    const params = {
      ...filters,
      search: searchTerm
    };
    return this.getItems(params);
  }

  // Get items by category
  async getItemsByCategory(category: string, filters?: Omit<ItemFilters, 'category'>): Promise<Item[]> {
    const params = {
      ...filters,
      category
    };
    return this.getItems(params);
  }

  // Get nearby items (location-based)
  async getNearbyItems(latitude: number, longitude: number, filters?: Omit<ItemFilters, 'latitude' | 'longitude'>): Promise<Item[]> {
    const params = {
      ...filters,
      latitude,
      longitude
    };
    return this.getItems(params);
  }
}

export const itemService = new ItemService();
export default itemService;

// Export types for use in components
export type { Item, ItemImage, ItemCreateData, ItemUpdateData, ItemFilters };
