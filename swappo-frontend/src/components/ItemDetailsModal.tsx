import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useItemsByUser } from '@/hooks/useItems';
import { useCreateTradeRequest } from '@/hooks/useTradeRequests';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar,
  User,
  Package,
  MessageSquare,
  Star,
  ArrowLeftRight,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { formatLocation, generateAvatar } from '@/utils/helpers';
import { calculateDistance } from '@/utils/location';
import "@/styles/components/ItemDetailsModal.css";

interface ItemDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any;
  tradeRequestMode?: 'none' | 'accept-reject';
  tradeRequestId?: string;
  onAcceptTrade?: (tradeId: string) => void;
  onRejectTrade?: (tradeId: string) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({ 
  isOpen, 
  onClose, 
  item,
  tradeRequestMode = 'none',
  tradeRequestId,
  onAcceptTrade,
  onRejectTrade
}) => {
  const { user, userLocation } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTradeItem, setSelectedTradeItem] = useState<string>('');
  const [hasRequested, setHasRequested] = useState(false);

  const createTradeRequestMutation = useCreateTradeRequest();
  const { data: userItemsData } = useItemsByUser(user?.id || '');
  const myItems = userItemsData?.items?.filter(myItem => 
    myItem.id !== item?.id && 
    myItem.status !== 'SWAPPED' && 
    myItem.status !== 'RESERVED' &&
    myItem.status !== 'REMOVED'
  ) || [];

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      setSelectedTradeItem('');
      setHasRequested(false);
    }
  }, [isOpen, item?.id]);

  useEffect(() => {
    setHasRequested(false);
  }, [item?.id, user?.id]);

  const handlePreviousImage = () => {
    if (!item?.images || item.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === 0 ? item.images.length - 1 : prev - 1
    );
  };

  const handleNextImage = () => {
    if (!item?.images || item.images.length === 0) return;
    setCurrentImageIndex((prev) => 
      prev === item.images.length - 1 ? 0 : prev + 1
    );
  };

  const handleTradeRequest = async () => {
    if (!selectedTradeItem) {
      toast.error('Please select an item to offer for trade');
      return;
    }

    if (!user) {
      toast.error('You must be logged in to request trades');
      return;
    }

    try {
      await createTradeRequestMutation.mutateAsync({
        requested_item_id: item.id,
        offered_item_id: selectedTradeItem
      });
      
      setHasRequested(true);
      setSelectedTradeItem('');
    } catch (error: any) {
      console.error('Failed to send trade request:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Date not available';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Date not available';
    }
  };

  const getDistance = () => {
    if (userLocation && item?.latitude && item?.longitude) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        item.latitude,
        item.longitude
      );
      return `${distance.toFixed(1)} km away`;
    }
    return formatLocation(item?.latitude, item?.longitude);
  };

  if (!item) return null;

  const images = item.images || [];
  const hasImages = images.length > 0;
  const isOwnItem = item.user?.id === user?.id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-content">
        <DialogHeader>
          <DialogTitle className="modal-title">
            <Package className="icon" />
            {item.title}
          </DialogTitle>
        </DialogHeader>

        <div className="modal-grid">
          {/* item image */}
          <div className="image-section">
            <div className="image-wrapper">
              {hasImages ? (
                <>
                  <img
                    src={images[currentImageIndex]}
                    alt={`${item.title} - Image ${currentImageIndex + 1}`}
                    className="main-image"
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="image-nav prev"
                        onClick={handlePreviousImage}
                      >
                        <ChevronLeft className="icon" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="image-nav next"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="icon" />
                      </Button>
                      <div className="image-counter">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="no-image">
                  <Package className="no-image-icon" />
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="thumbnails">
                {images.map((image: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                  >
                    <img src={image} alt={`Thumbnail ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Item information */}
          <div className="details-section">
            <div className="item-description">
              <Badge className="badge-40">{item.condition}</Badge>
              <Badge variant="outline" className="badge-40">{item.category}</Badge>
              <p>{item.description}</p>
            </div>

            {/* details of the owner */}
            <Card className="owner-card">
              <CardContent className="owner-card-content">
                <div className="owner-info">
                  <img
                    src="/icons/user.png"
                    alt={item.user.name}
                    className="owner-avatar"
                  />
                  <div className="owner-text">
                    <h4>{item.user.name}</h4>
                    <p>{item.user.badge || 'BRONZE'} Trader</p>
                  </div>
                  <span className="owner-points">{item.user.loyalty_points}</span>
                </div>
              </CardContent>
            </Card>

            {/* Location / Date */}
            <div className="meta-info">
              <div className="meta">
                <MapPin className="icon" />
                <span>{getDistance()}</span>
              </div>
              <div className="meta">
                <Calendar className="icon" />
                <span>Posted on {formatDate(item.posted_at || item.postedAt)}</span>
              </div>
            </div>

            {/* Requests Count */}
            <Card className="requests-card">
              <CardContent>
                <div className="requests-info">
                  <MessageSquare className="icon primary" />
                  <div>
                    <p>{item._count?.trade_requests_for || 0} Trade Requests</p>
                    <span>
                      {item._count?.trade_requests_for === 0 
                        ? 'Be the first to request a trade!' 
                        : 'This item is in demand!'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trade Request Section */}
            {!isOwnItem && tradeRequestMode === 'none' && (
              <div className="trade-request">
                <h3><ArrowLeftRight className="icon" /> Request Trade</h3>

                {hasRequested ? (
                  <Card className="requested-card">
                    <CardContent>
                      <CheckCircle className="icon yellow" />
                      <div>
                        <p>Trade Requested</p>
                        <span>You've already requested a trade for this item.</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : myItems.length === 0 ? (
                  <Card className="no-items-card">
                    <CardContent>
                      <AlertCircle className="icon orange" />
                      <div>
                        <p>No Items to Trade</p>
                        <span>You need to post at least one item before you can trade.</span>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <>
                    <Select value={selectedTradeItem} onValueChange={setSelectedTradeItem}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose one of your items..." />
                      </SelectTrigger>
                      <SelectContent>
                        {myItems.map((myItem) => (
                          <SelectItem key={myItem.id} value={myItem.id}>
                            {myItem.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleTradeRequest}
                      disabled={!selectedTradeItem || createTradeRequestMutation.isPending}
                      className="trade-request-btn"
                      style={{
                        backgroundColor: !selectedTradeItem || createTradeRequestMutation.isPending ? '#9ca3af' : '#2563eb',
                        color: 'white',
                        width: '100%',
                        padding: '10px',
                        borderRadius: '6px',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (!(!selectedTradeItem || createTradeRequestMutation.isPending)) {
                          e.currentTarget.style.backgroundColor = '#60a5fa';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!(!selectedTradeItem || createTradeRequestMutation.isPending)) {
                          e.currentTarget.style.backgroundColor = '#2563eb';
                        }
                      }}
                    >
                      {createTradeRequestMutation.isPending ? (
                        <Loader2 className="icon spin" />
                      ) : (
                        <ArrowLeftRight className="icon" />
                      )}
                      Send Trade Request
                    </Button>
                  </>
                )}
              </div>
            )}

            {/* accept or reject */}
            {tradeRequestMode === 'accept-reject' && tradeRequestId && (
              <div className="trade-actions">
                <Button onClick={() => onAcceptTrade?.(tradeRequestId)} className="accept-btn">
                  <CheckCircle className="icon" /> Accept
                </Button>
                <Button onClick={() => onRejectTrade?.(tradeRequestId)} className="reject-btn">
                  <AlertCircle className="icon" /> Reject
                </Button>
              </div>
            )}

            {/* Item */}
            {isOwnItem && (
              <Card className="own-item-card">
                <CardContent>
                  <User className="icon blue" />
                  <div>
                    <p>This is your item</p>
                    <span>Manage it from your "My Items" section.</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
