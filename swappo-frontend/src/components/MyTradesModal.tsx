import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  useMyTrades, 
  useReceivedRequests, 
  useSentRequests,
  useAcceptTradeRequest,
  useRejectTradeRequest,
  useCancelTradeRequest,
  useCompleteTrade
} from '@/hooks/useTradeRequests';
import { TradeRequest, Trade } from '@/types/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ProfileModal from '@/components/ProfileModal';
import { RatingModal } from '@/components/RatingModal';
import { ItemViewModal } from '@/components/ItemViewModal';
import { 
  ArrowRightLeft,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Trash2,
  Calendar,
  Package,
  Loader2,
  Phone,
  MessageCircle,
  Star,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl } from '@/config/env';
import { generateAvatar } from '@/utils/helpers';
import "@/styles/components/MyTradesModal.css";

interface MyTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewItem?: (item: any) => void;
}

export const MyTradesModal: React.FC<MyTradesModalProps> = ({
  isOpen,
  onClose,
  onViewItem
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('received');
  const [revealedContacts, setRevealedContacts] = useState<Set<string>>(new Set());
  const [ratingModalState, setRatingModalState] = useState<{
    isOpen: boolean;
    tradeId: string;
    tradePartner: any;
    tradeDetails: any;
  } | null>(null);
  const [ratedTrades, setRatedTrades] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewItemModalState, setViewItemModalState] = useState<{
    isOpen: boolean;
    item: any;
  } | null>(null);

  // API hooks with safe defaults
  const { data: myTrades = [], isLoading: tradesLoading, error: tradesError, refetch: refetchTrades } = useMyTrades();
  const { data: receivedRequests = [], isLoading: receivedLoading, error: receivedError, refetch: refetchReceived } = useReceivedRequests();
  const { data: sentRequests = [], isLoading: sentLoading, error: sentError, refetch: refetchSent } = useSentRequests();

  // Ensure all data are arrays
  const safeMyTrades = Array.isArray(myTrades) ? myTrades : [];
  const safeReceivedRequests = Array.isArray(receivedRequests) ? receivedRequests : [];
  const safeSentRequests = Array.isArray(sentRequests) ? sentRequests : [];

  // Filter sent requests to exclude accepted ones
  const pendingSentRequests = safeSentRequests.filter(request => request.status !== 'ACCEPTED');

  // Filter received requests to exclude accepted ones (only show pending and rejected)
  const pendingReceivedRequests = safeReceivedRequests.filter(request => 
    request.status !== 'ACCEPTED'
  );



  // Filter for accepted requests (both received and sent that are accepted - show all including completed)
  const acceptedRequests = [
    ...safeReceivedRequests.filter(request => 
      request.status === 'ACCEPTED'
    ),
    ...safeSentRequests.filter(request => 
      request.status === 'ACCEPTED'
    )
  ];

  // Log errors for debugging
  React.useEffect(() => {
    if (tradesError) console.error('Trades error:', tradesError);
    if (receivedError) console.error('Received requests error:', receivedError);
    if (sentError) console.error('Sent requests error:', sentError);
    
    // Debug data structure
    if (safeReceivedRequests.length > 0) {
      console.log('Sample received request structure:', safeReceivedRequests[0]);
    }
    if (safeSentRequests.length > 0) {
      console.log('Sample sent request structure:', safeSentRequests[0]);
    }
  }, [tradesError, receivedError, sentError, safeReceivedRequests, safeSentRequests]);

  // Mutation hooks
  const acceptTradeMutation = useAcceptTradeRequest();
  const rejectTradeMutation = useRejectTradeRequest();
  const cancelTradeMutation = useCancelTradeRequest();
  const completeTradeRequest = useCompleteTrade();

  const isLoading = tradesLoading || receivedLoading || sentLoading;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': case 'completed': return 'bg-green-100 text-green-800';
      case 'rejected': case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': case 'failed': return <XCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleAcceptTrade = async (tradeId: string) => {
    try {
      await acceptTradeMutation.mutateAsync(tradeId);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Accept trade error:', error);
    }
  };

  const handleRejectTrade = async (tradeId: string) => {
    try {
      await rejectTradeMutation.mutateAsync(tradeId);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Reject trade error:', error);
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    try {
      await cancelTradeMutation.mutateAsync(tradeId);
    } catch (error) {
      // Error handling is done in the mutation hook
      console.error('Cancel trade error:', error);
    }
  };

  const handleCompleteTrade = async (requestId: string) => {
    try {
      await completeTradeRequest.mutateAsync(requestId);
    } catch (error) {
      console.error('Complete trade error:', error);
    }
  };

  const handleRevealContacts = (requestId: string) => {
    setRevealedContacts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
        toast.success('Contact information hidden');
      } else {
        newSet.add(requestId);
        toast.success('Contact information revealed');
      }
      return newSet;
    });
  };

  const handleOpenRatingModal = (request: TradeRequest, requestType: 'sent' | 'received' | 'accepted') => {
    console.log('Opening rating modal for request:', request);
    console.log('Current user ID:', user?.id);
    console.log('Request type:', requestType);
    
    // Use the request type to determine if this is received or sent
    // For accepted requests, we need to determine the original direction
    let isReceived = false;
    let tradePartner = null;
    
    if (requestType === 'received') {
      // This is a received request - someone wants our item
      isReceived = true;
      tradePartner = request.requester;
    } else if (requestType === 'sent') {
      // This is a sent request - we want someone else's item
      isReceived = false;
      tradePartner = request.requested_item?.user;
    } else if (requestType === 'accepted') {
      // For accepted requests, use trade data if available for better accuracy
      if (request.trade && request.trade.owner_id && request.trade.requester_id) {
        // Use trade data for better accuracy
        if (request.trade.owner_id === user?.id) {
          // Current user is the owner (owns the requested item) - this was a received request
          isReceived = true;
          tradePartner = request.requester;
        } else if (request.trade.requester_id === user?.id) {
          // Current user is the requester - this was a sent request
          isReceived = false;
          tradePartner = request.requested_item?.user;
        }
      } else {
        // Fallback to trade request data if trade data is not available
        if (request.requested_item?.user?.id === user?.id) {
          // Current user owns the requested item - this was a received request
          isReceived = true;
          tradePartner = request.requester;
        } else if (request.requester?.id === user?.id) {
          // Current user is the requester - this was a sent request
          isReceived = false;
          tradePartner = request.requested_item?.user;
        } else {
          // Final fallback logic for accepted requests
          console.log('Fallback logic for accepted request');
          
          // Check if current user is the owner of offered item
          if (request.offered_item?.user?.id === user?.id) {
            isReceived = true;
            tradePartner = request.requester || request.requested_item?.user;
          } 
          // Check if current user is the requester
          else if (request.requester?.id === user?.id) {
            isReceived = false;
            tradePartner = request.requested_item?.user || request.offered_item?.user;
          }
          // Final fallback - try to find any user that's not the current user
          else {
            const possiblePartners = [
              request.requester,
              request.requested_item?.user,
              request.offered_item?.user
            ].filter(partner => partner && partner.id && partner.id !== user?.id);
            
            if (possiblePartners.length > 0) {
              tradePartner = possiblePartners[0];
              // Default to received for accepted requests when we can't determine
              isReceived = true;
            }
          }
        }
      }
    }
    
    // Get items involved in the trade
    const myItem = isReceived ? request.requested_item : request.offered_item;
    const theirItem = isReceived ? request.offered_item : request.requested_item;

    console.log('Trade data:', {
      isReceived,
      tradePartner,
      myItem,
      theirItem,
      userId: user?.id,
      requestStructure: {
        requester: request.requester,
        requestedItemUser: request.requested_item?.user,
        offeredItemUser: request.offered_item?.user
      }
    });

    // Validate required data
    if (!tradePartner) {
      console.error('Missing trade partner:', { request, isReceived });
      console.error('Available data:', {
        requester: request.requester,
        requestedItemUser: request.requested_item?.user,
        offeredItemUser: request.offered_item?.user,
        currentUserId: user?.id
      });
      toast.error('Unable to identify trade partner for rating');
      return;
    }

    if (!myItem) {
      console.error('Missing my item:', { request, isReceived });
      toast.error('Unable to load your item details for rating');
      return;
    }

    if (!theirItem) {
      console.error('Missing their item:', { request, isReceived });
      toast.error('Unable to load partner\'s item details for rating');
      return;
    }

    // All data is valid, set up rating modal
    setRatingModalState({
      isOpen: true,
      tradeId: request.id,
      tradePartner: {
        id: tradePartner.id,
        name: tradePartner.name || 'Unknown User',
        image: tradePartner.image,
        loyalty_points: tradePartner.loyalty_points || 0
      },
      tradeDetails: {
        myItem: {
          title: myItem.title || 'Unknown Item',
          category: myItem.category || 'Unknown',
          condition: myItem.condition || 'GOOD',
          images: myItem.images || []
        },
        theirItem: {
          title: theirItem.title || 'Unknown Item',
          category: theirItem.category || 'Unknown',
          condition: theirItem.condition || 'GOOD',
          images: theirItem.images || []
        }
      }
    });

    console.log('Rating modal state set successfully');
  };

  const handleCloseRatingModal = () => {
    setRatingModalState(null);
  };

  const handleRatingSubmitted = () => {
    // Add the trade to rated trades set
    if (ratingModalState) {
      setRatedTrades(prev => new Set(prev).add(ratingModalState.tradeId));
    }
    // Optionally refresh trade requests or show success message
    toast.success('Thank you for your feedback!');
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Refresh all trade-related data
      await Promise.all([
        refetchTrades?.(),
        refetchReceived?.(),
        refetchSent?.()
      ]);
      
      // Clear any cached contact reveals and ratings state
      setRevealedContacts(new Set());
      
      toast.success('Trade data refreshed successfully!');
    } catch (error) {
      console.error('Failed to refresh trade data:', error);
      toast.error('Failed to refresh data. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleViewItem = (item: any) => {
    // Transform the item data to match the expected structure for the ItemViewModal
    const transformedItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      // Handle different image URL formats - they might be objects with url property or direct URLs
      images: item.images?.map((img: any) => {
        if (typeof img === 'string') {
          return { url: img };
        } else if (img && img.url) {
          return img;
        } else {
          return { url: '/placeholder.svg' };
        }
      }) || [],
      location: 'Location not available',
      postedAt: new Date().toISOString(),
      user: item.user || {
        id: '1',
        name: 'Unknown User',
        image: null,
        badge: 'BRONZE',
        rating: 4.5
      },
      tradeRequests: 0
    };
    
    console.log('Opening item view modal with data:', transformedItem);
    
    setViewItemModalState({
      isOpen: true,
      item: transformedItem
    });
  };

  const handleCloseViewItemModal = () => {
    setViewItemModalState(null);
  };

  // Trade Request Card Component
  const TradeRequestCard = ({ 
    request, 
    type, 
    showContacts = false, 
    onRevealContacts,
    onCompleteTrade 
  }: { 
    request: TradeRequest; 
    type: 'sent' | 'received' | 'accepted'; 
    showContacts?: boolean;
    onRevealContacts?: (requestId: string) => void;
    onCompleteTrade?: (requestId: string) => void;
  }) => {
    // Properly determine if this is a received request
    let isReceived = false;
    
    if (type === 'received') {
      isReceived = true;
    } else if (type === 'sent') {
      isReceived = false;
    } else if (type === 'accepted') {
      // For accepted requests, use trade data if available
      if (request.trade && request.trade.owner_id && request.trade.requester_id) {
        // Use trade data for better accuracy
        if (request.trade.owner_id === user?.id) {
          // Current user is the owner (owns the requested item) - this was a received request
          isReceived = true;
        } else if (request.trade.requester_id === user?.id) {
          // Current user is the requester - this was a sent request
          isReceived = false;
        }
      } else {
        // Fallback to trade request data if trade data is not available
        if (request.requested_item?.user?.id === user?.id) {
          // Current user owns the requested item - this was a received request
          isReceived = true;
        } else if (request.requester?.id === user?.id) {
          // Current user is the requester - this was a sent request  
          isReceived = false;
        } else {
          // Final fallback logic
          if (request.offered_item?.user?.id === user?.id) {
            isReceived = true;
          } else {
            isReceived = false; // Default to sent if unclear
          }
        }
      }
    }
    
    const isAccepted = type === 'accepted';
    
    // Robust trade partner identification
    let otherUser = null;
    
    if (isReceived) {
      // For received requests: otherUser is the requester (person who wants our item)
      otherUser = request.requester;
    } else {
      // For sent requests: otherUser is the owner of the requested item
      otherUser = request.requested_item?.user;
      
      // Fallback for sent requests if requested item user is missing
      if (!otherUser && request.offered_item?.user?.id !== user?.id) {
        otherUser = request.offered_item?.user;
      }
    }
    
    // Additional fallback - find any user that's not the current user
    if (!otherUser) {
      const possibleUsers = [
        request.requester,
        request.requested_item?.user,
        request.offered_item?.user
      ].filter(u => u && u.id && u.id !== user?.id);
      
      if (possibleUsers.length > 0) {
        otherUser = possibleUsers[0];
      }
    }
    
    const myItem = isReceived ? request.requested_item : request.offered_item;
    const theirItem = isReceived ? request.offered_item : request.requested_item;
    
    const isMutating = acceptTradeMutation.isPending || rejectTradeMutation.isPending || cancelTradeMutation.isPending || completeTradeRequest.isPending;

    // Safety check - if we don't have the required data, show error message
    if (!otherUser || !myItem || !theirItem) {
      console.warn('Missing required data for trade request:', { 
        requestId: request.id,
        type,
        otherUser: !!otherUser, 
        myItem: !!myItem, 
        theirItem: !!theirItem,
        currentUserId: user?.id,
        requestStructure: {
          requester: request.requester,
          requestedItemUser: request.requested_item?.user,
          offeredItemUser: request.offered_item?.user
        },
        request 
      });
      
      return (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Unable to load trade details</p>
                <p className="text-sm text-red-500">
                  Missing: {!otherUser && 'trade partner'} {!myItem && 'your item'} {!theirItem && 'their item'}
                </p>
                <p className="text-xs text-red-400 mt-1">
                  Request ID: {request.id} | Type: {type} | User: {user?.id}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // Check if the trade is completed
    const isTradeCompleted = request.trade && request.trade.status === 'COMPLETED';
    const isTradeAccepted = request.status === 'ACCEPTED';


    return (
      <Card className="mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ProfileModal 
                user={otherUser}
                trigger={
                  <Button variant="ghost" size="sm" className="h-auto p-1 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={otherUser.image || undefined} />
                      <AvatarFallback>
                        {(otherUser.name || 'Unknown').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                }
              />
              <div>
                <p className="font-semibold">{otherUser.name || 'Unknown User'}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(request.requested_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge className={`${
              isTradeCompleted 
                ? 'bg-green-100 text-green-800' 
                : getStatusColor(request.status)
            } flex items-center space-x-1`}>
              {isTradeCompleted ? (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>Completed</span>
                </>
              ) : (
                <>
                  {getStatusIcon(request.status)}
                  <span className="capitalize">{request.status.toLowerCase()}</span>
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* My Item */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                {isReceived ? 'Your Item' : 'Your Offer'}
              </h4>
              <div className="flex space-x-3 p-3 border rounded-lg">
                <img
                  src={getImageUrl(myItem.images?.[0]?.url) || '/placeholder.svg'}
                  alt={myItem.title || 'Item'}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h5 className="font-semibold text-sm">{myItem.title || 'Unknown Item'}</h5>
                  <Badge variant="outline" className="text-xs mt-1">
                    {myItem.category || 'Unknown'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {(myItem.condition || 'GOOD').toLowerCase().replace('_', ' ')} condition
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <ArrowRightLeft className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* Their Item */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm text-muted-foreground">
                {isReceived ? 'Their Offer' : 'Requested Item'}
              </h4>
              <div className="flex space-x-3 p-3 border rounded-lg">
                <img
                  src={getImageUrl(theirItem.images?.[0]?.url) || '/placeholder.svg'}
                  alt={theirItem.title || 'Item'}
                  className="w-16 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h5 className="font-semibold text-sm">{theirItem.title || 'Unknown Item'}</h5>
                  <Badge variant="outline" className="text-xs mt-1">
                    {theirItem.category || 'Unknown'}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {(theirItem.condition || 'GOOD').toLowerCase().replace('_', ' ')} condition
                  </p>
                  {/* Show phone numbers for their item if contacts are revealed */}
                  {isAccepted && revealedContacts.has(request.id) && theirItem.phone_number && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-1 text-xs text-green-600">
                        <Phone className="h-3 w-3" />
                        <span>Phone: {theirItem.phone_number}</span>
                      </div>
                      {theirItem.whatsapp_number && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <MessageCircle className="h-3 w-3" />
                          <span>WhatsApp: {theirItem.whatsapp_number}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            {/* Buttons for accepted requests */}
            {isAccepted && (
              <>
                {/* Show buttons only for non-completed trades */}
                {!isTradeCompleted && (
                  <>
                    {/* Toggle "Reveal Contacts" button for accepted requests */}
                    <Button
                      onClick={() => handleRevealContacts(request.id)}
                      variant={revealedContacts.has(request.id) ? "default" : "outline"}
                      className="flex-1"
                      size="sm"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {revealedContacts.has(request.id) ? 'Hide Contacts' : 'Reveal Contacts'}
                    </Button>

                    {/* Show "Complete Trade" button only for accepted trades that aren't completed */}
                    {onCompleteTrade && isTradeAccepted && request.trade && request.trade.status === 'PENDING' && (
                      <Button
                        onClick={() => onCompleteTrade(request.id)}
                        disabled={completeTradeRequest.isPending}
                        className="flex-1"
                        size="sm"
                      >
                        {completeTradeRequest.isPending ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4 mr-2" />
                        )}
                        Complete Trade
                      </Button>
                    )}
                  </>
                )}

                {/* Show "Completed" button for completed trades */}
                {isTradeCompleted && (
                  <>
                    <Button
                      disabled={true}
                      className="flex-1 bg-green-50 border border-green-200 text-green-700 cursor-not-allowed hover:bg-green-50"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                      Trade Completed
                    </Button>
                    
                    {/* Rate User button for completed trades */}
                    {!ratedTrades.has(request.id) && (
                      <Button
                        onClick={() => {
                          console.log('Rate button clicked for request:', request.id);
                          handleOpenRatingModal(request, type);
                        }}
                        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
                        size="sm"
                      >
                        <Star className="h-4 w-4 mr-2" />
                        Rate User
                      </Button>
                    )}
                    
                    {/* Already Rated indicator */}
                    {ratedTrades.has(request.id) && (
                      <Button
                        disabled={true}
                        className="flex-1 bg-green-100 border border-green-200 text-green-700 cursor-not-allowed"
                        size="sm"
                      >
                        <Star className="h-4 w-4 mr-2 fill-yellow-400 text-yellow-500" />
                        Rated
                      </Button>
                    )}
                  </>
                )}
              </>
            )}

            {/* Original buttons for received requests */}
            {isReceived && request.status === 'PENDING' && (
              <>
                <Button
                  onClick={() => handleAcceptTrade(request.id)}
                  disabled={isMutating}
                  className="flex-1"
                  size="sm"
                >
                  {acceptTradeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Accept Request
                </Button>
                <Button
                  onClick={() => handleRejectTrade(request.id)}
                  disabled={isMutating}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  {rejectTradeMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject Request
                </Button>
              </>
            )}
            
            {/* Button for pending sent requests */}
            {!isReceived && !isAccepted && request.status === 'PENDING' && (
              <Button
                onClick={() => handleCancelTrade(request.id)}
                disabled={isMutating}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                {cancelTradeMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Cancel Request
              </Button>
            )}

            {/* View Item button - always show for all requests */}
            <Button
              onClick={() => handleViewItem(theirItem)}
              variant="outline"
              size="sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              View Their Item
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between mt-10">
            <DialogTitle className="flex items-center space-x-2">
              <ArrowRightLeft className="h-5 w-5" />
              <span>My Trades</span>
            </DialogTitle>
            <Button
              onClick={handleRefresh}
              disabled={isRefreshing || isLoading}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="received" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Received ({pendingReceivedRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="sent" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>Sent ({pendingSentRequests.length})</span>
            </TabsTrigger>
            <TabsTrigger value="accepted" className="flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Accepted ({acceptedRequests.length})</span>
            </TabsTrigger>
          </TabsList>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your trades...</p>
            </div>
          )}

          {/* Error State */}
          {(tradesError || receivedError || sentError) && !isLoading && (
            <div className="text-center py-8">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Failed to load trades</h3>
              <p className="text-muted-foreground">Please try again later</p>
            </div>
          )}

          {/* Tab Contents - only show when not loading and no errors */}
          {!isLoading && !tradesError && !receivedError && !sentError && (
            <>
              <TabsContent value="received" className="space-y-4 mt-6">
                {pendingReceivedRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No received requests</h3>
                    <p className="text-muted-foreground">Trade requests you receive will appear here</p>
                  </div>
                ) : (
                  pendingReceivedRequests.map((request) => (
                    <TradeRequestCard key={request.id} request={request} type="received" />
                  ))
                )}
              </TabsContent>

              <TabsContent value="sent" className="space-y-4 mt-6">
                {pendingSentRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No sent requests</h3>
                    <p className="text-muted-foreground">Trade requests you send will appear here</p>
                  </div>
                ) : (
                  pendingSentRequests.map((request) => (
                    <TradeRequestCard key={request.id} request={request} type="sent" />
                  ))
                )}
              </TabsContent>

              <TabsContent value="accepted" className="space-y-4 mt-6">
                {acceptedRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No accepted requests</h3>
                    <p className="text-muted-foreground">Accepted trade requests will appear here</p>
                  </div>
                ) : (
                  acceptedRequests.map((request) => (
                    <TradeRequestCard 
                      key={request.id} 
                      request={request} 
                      type="accepted"
                      showContacts={true}
                      onRevealContacts={handleRevealContacts}
                      onCompleteTrade={handleCompleteTrade}
                    />
                  ))
                )}
              </TabsContent>
            </>
          )}
        </Tabs>

        {/* Rating Modal */}
        {ratingModalState && (
          <RatingModal
            isOpen={ratingModalState.isOpen}
            onClose={handleCloseRatingModal}
            tradeId={ratingModalState.tradeId}
            tradePartner={ratingModalState.tradePartner}
            tradeDetails={ratingModalState.tradeDetails}
            onRatingSubmitted={handleRatingSubmitted}
          />
        )}

        {/* Item View Modal */}
        {viewItemModalState && (
          <ItemViewModal
            isOpen={viewItemModalState.isOpen}
            onClose={handleCloseViewItemModal}
            item={viewItemModalState.item}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
