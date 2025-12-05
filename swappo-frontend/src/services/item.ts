import { apiClient } from './api';
import { 
  Item, 
  ItemCreateRequest, 
  ItemUpdateRequest,
  ItemsQuery,
  ItemStatus 
} from '@/types/api';

class ItemService {
  // Get all items with optional filters
  async getItems(query?: ItemsQuery): Promise<Item[]> {
    const response = await apiClient.get<Item[]>('/items', query);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get items');
  }

  // Get single item by ID
  async getItem(itemId: string): Promise<Item> {
    const response = await apiClient.get<Item>(`/items/${itemId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get item');
  }

  // Get items by user ID
  async getItemsByUser(userId: string): Promise<{ items: Item[] }> {
    const response = await apiClient.get<{ items: Item[] }>(`/items/user/${userId}`);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to get user items');
  }

  // Create new item with images
  async createItem(formData: FormData): Promise<Item> {
    // Use the regular post method since items API follows standard format
    const response = await apiClient.post<Item>('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to create item');
  }

  // Update item with optional new images and image removal
  async updateItem(itemId: string, data: ItemUpdateRequest, newImages?: File[]): Promise<Item> {
    const formData = new FormData();
    
    // Add text fields (only if they exist)
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.condition) formData.append('condition', data.condition);
    if (data.latitude !== undefined) formData.append('latitude', data.latitude.toString());
    if (data.longitude !== undefined) formData.append('longitude', data.longitude.toString());
    if (data.removeImageIds) formData.append('removeImageIds', data.removeImageIds);

    // Add new images
    if (newImages && newImages.length > 0) {
      newImages.forEach((image) => {
        formData.append('newImages', image);
      });
    }

    const response = await apiClient.uploadFile<Item>(`/items/${itemId}`, formData);
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update item');
  }

  // Delete item
  async deleteItem(itemId: string): Promise<void> {
    const response = await apiClient.delete(`/items/${itemId}`);
    if (!response.success) {
      throw new Error(response.message || 'Failed to delete item');
    }
  }

  // Update item status
  async updateItemStatus(itemId: string, status: 'AVAILABLE' | 'REMOVED'): Promise<Item> {
    const response = await apiClient.put<Item>(`/items/${itemId}/status`, { status });
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Failed to update item status');
  }
}

export const itemService = new ItemService();
export default itemService;
