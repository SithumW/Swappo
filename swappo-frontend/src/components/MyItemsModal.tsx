import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useItemsByUser, useDeleteItem } from '@/hooks/useItems';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  MessageSquare, 
  Calendar,
  Package,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import "@/styles/components/MyItemsModal.css";
import { formatLocation, generateAvatar } from '@/utils/helpers';
import { getImageUrl } from '@/config/env';

interface MyItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyItemsModal: React.FC<MyItemsModalProps> = ({ 
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  
  // Fetch user's items using the new dedicated endpoint
  const { 
    data: userItemsData, 
    isLoading: itemsLoading, 
    error: itemsError,
  } = useItemsByUser(user?.id || '');

  const deleteItemMutation = useDeleteItem();

  // Extract items from the response data and filter out SWAPPED items
  const myItems = userItemsData?.items?.filter(item => item.status !== 'SWAPPED') || [];

  const handleDeleteItem = async (itemId: string, itemTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${itemTitle}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingItemId(itemId);
    
    try {
      await deleteItemMutation.mutateAsync(itemId);
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Failed to delete item:', error);
      // Error toast is already handled by the mutation
    } finally {
      setDeletingItemId(null);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition.toUpperCase()) {
      case 'NEW': return 'bg-green-100 text-green-800';
      case 'GOOD': return 'bg-blue-100 text-blue-800';
      case 'FAIR': return 'bg-yellow-100 text-yellow-800';
      case 'POOR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            My Items ({myItems.length})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Loading State */}
          {itemsLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                <p className="text-muted-foreground">Loading your items...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {itemsError && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="flex items-center gap-3 p-4">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <div>
                  <h3 className="font-medium text-red-800">Failed to load items</h3>
                  <p className="text-sm text-red-600">Please try again later.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State */}
          {!itemsLoading && !itemsError && myItems.length === 0 && (
            <Card className="border-dashed border-2 border-muted-foreground/25">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No items listed yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  You haven't posted any items for trade yet. Start by clicking the "Post Item" button.
                </p>
                <Button onClick={onClose} variant="outline">
                  Close and Post Your First Item
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Items List */}
          {!itemsLoading && myItems.length > 0 && (
            <div className="grid gap-4">
              {myItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex min-h-[180px] items-center">
                      {/* Item Image - Left Side */}
                      <div className="w-60 h-full bg-muted flex items-center justify-center shrink-0">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.images[0].url) || '/placeholder.svg'}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-muted-foreground" />
                        )}
                      </div>

                      {/* Item Details - Right Side */}
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            {/* Title and Category */}
                            <div>
                              <h3 className="font-semibold text-lg">{item.title}</h3>
                              <p className="text-sm text-muted-foreground">{item.category}</p>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-muted-foreground max-w-md overflow-hidden">
                              {item.description.length > 100 
                                ? `${item.description.substring(0, 100)}...` 
                                : item.description
                              }
                            </p>

                            {/* Condition and Status */}
                            <div className="flex items-center gap-2">
                              <Badge className={getConditionColor(item.condition)}>
                                {item.condition}
                              </Badge>
                              <Badge variant="outline">
                                {item.status || 'AVAILABLE'}
                              </Badge>
                            </div>

                            {/* Location and Date */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {item.latitude && item.longitude && (
                                <span>{formatLocation(item.latitude, item.longitude)}</span>
                              )}
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Posted {formatDate(item.posted_at)}
                              </span>
                            </div>

                            {/* Trade Requests */}
                            <div className="flex items-center gap-2 pt-2">
                              <div className="flex items-center gap-1 text-sm">
                                <MessageSquare className="h-4 w-4 text-primary" />
                                <span className="font-medium text-primary">
                                  {item._count?.trade_requests_for || 0}
                                </span>
                                <span className="text-muted-foreground">
                                  trade request{(item._count?.trade_requests_for || 0) !== 1 ? 's' : ''}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteItem(item.id, item.title)}
                              disabled={deletingItemId === item.id || deleteItemMutation.isPending}
                              className="shrink-0"
                            >
                              {deletingItemId === item.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          
        </div>
      </DialogContent>
    </Dialog>
  );
};
