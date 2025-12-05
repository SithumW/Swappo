import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  Calendar,
  Package,
  MapPin
} from 'lucide-react';
import { getImageUrl } from '@/config/env';
import "@/styles/components/ItemViewModal.css";

interface ItemViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
}

export const ItemViewModal: React.FC<ItemViewModalProps> = ({ 
  isOpen, 
  onClose, 
  item 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!item) return null;

  const images = item.images || [];
  const hasImages = images.length > 0;

  const nextImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (hasImages) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'very_good': return 'bg-blue-100 text-blue-800';
      case 'good': return 'bg-yellow-100 text-yellow-800';
      case 'fair': return 'bg-orange-100 text-orange-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Package className="h-5 w-5" />
              <span>Item Details</span>
            </DialogTitle>
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image Section */}
          <Card>
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                {hasImages ? (
                  <>
                    <img
                      src={getImageUrl(images[currentImageIndex]?.url) || '/placeholder.svg'}
                      alt={item.title || 'Item image'}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Image Navigation */}
                    {images.length > 1 && (
                      <>
                        <Button
                          onClick={prevImage}
                          variant="secondary"
                          size="sm"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={nextImage}
                          variant="secondary"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full w-8 h-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                        
                        {/* Image Counter */}
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                          {currentImageIndex + 1} / {images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Item Details */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{item.title || 'Unknown Item'}</h2>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant="outline">
                      {item.category || 'Unknown Category'}
                    </Badge>
                    <Badge className={getConditionColor(item.condition)}>
                      {(item.condition || 'GOOD').toLowerCase().replace('_', ' ')} condition
                    </Badge>
                  </div>
                </div>

                {item.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">{item.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Posted: {new Date(item.postedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                  
                  {item.location && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>

                {/* Owner Info */}
                {item.user && (
                  <div>
                    <h3 className="font-semibold mb-2">Owner</h3>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                        {item.user.image ? (
                          <img 
                            src={item.user.image} 
                            alt={item.user.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {(item.user.name || 'U').charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.user.name || 'Unknown User'}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {(item.user.badge || 'bronze').toLowerCase()} member
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
