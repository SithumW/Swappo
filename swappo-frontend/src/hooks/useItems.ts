import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { itemService } from '@/services/item';
import { Item, ItemsQuery, ItemCreateRequest, ItemUpdateRequest } from '@/types/api';
import { toast } from 'sonner';

// Get all items with optional filters
export const useItems = (query?: ItemsQuery) => {
  return useQuery({
    queryKey: ['items', query],
    queryFn: () => itemService.getItems(query),
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get single item by ID
export const useItem = (itemId: string) => {
  return useQuery({
    queryKey: ['item', itemId],
    queryFn: () => itemService.getItem(itemId),
    enabled: !!itemId,
    refetchOnWindowFocus: false,
  });
};

// Get items by user ID
export const useItemsByUser = (userId: string) => {
  return useQuery({
    queryKey: ['items', 'user', userId],
    queryFn: () => itemService.getItemsByUser(userId),
    enabled: !!userId,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Create new item mutation
export const useCreateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => itemService.createItem(formData),
    onSuccess: (newItem) => {
      // Invalidate and refetch items queries
      queryClient.invalidateQueries({ queryKey: ['items'] });
      // Invalidate user-specific items queries
      queryClient.invalidateQueries({ queryKey: ['items', 'user'] });
      toast.success('Item created successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create item');
    },
  });
};

// Update item mutation
export const useUpdateItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      itemId, 
      data, 
      newImages 
    }: { 
      itemId: string; 
      data: ItemUpdateRequest; 
      newImages?: File[] 
    }) => itemService.updateItem(itemId, data, newImages),
    onSuccess: (updatedItem, variables) => {
      // Update the item in cache
      queryClient.setQueryData(['item', variables.itemId], updatedItem);
      // Invalidate items queries
      queryClient.invalidateQueries({ queryKey: ['items'] });
      // Invalidate user-specific items queries
      queryClient.invalidateQueries({ queryKey: ['items', 'user'] });
      toast.success('Item updated successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update item');
    },
  });
};

// Delete item mutation
export const useDeleteItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (itemId: string) => itemService.deleteItem(itemId),
    onSuccess: (_, itemId) => {
      // Remove item from cache
      queryClient.removeQueries({ queryKey: ['item', itemId] });
      // Invalidate items queries
      queryClient.invalidateQueries({ queryKey: ['items'] });
      // Invalidate user-specific items queries
      queryClient.invalidateQueries({ queryKey: ['items', 'user'] });
      toast.success('Item deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete item');
    },
  });
};

// Update item status mutation
export const useUpdateItemStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, status }: { itemId: string; status: 'AVAILABLE' | 'REMOVED' }) =>
      itemService.updateItemStatus(itemId, status),
    onSuccess: (updatedItem, variables) => {
      // Update the item in cache
      queryClient.setQueryData(['item', variables.itemId], updatedItem);
      // Invalidate items queries
      queryClient.invalidateQueries({ queryKey: ['items'] });
      // Invalidate user-specific items queries
      queryClient.invalidateQueries({ queryKey: ['items', 'user'] });
      toast.success(`Item ${variables.status.toLowerCase()} successfully!`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update item status');
    },
  });
};
