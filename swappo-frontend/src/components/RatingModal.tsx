import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ratingService } from '@/services/rating';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, ArrowRightLeft, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getImageUrl, config } from '@/config/env';

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeId: string;
  tradePartner: {
    id: string;
    name: string;
    image?: string;
    loyalty_points?: number;
  };
  tradeDetails: {
    myItem: {
      title: string;
      category: string;
      condition: string;
      images: any[];
    };
    theirItem: {
      title: string;
      category: string;
      condition: string;
      images: any[];
    };
  };
  onRatingSubmitted?: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  tradeId,
  tradePartner,
  tradeDetails,
  onRatingSubmitted
}) => {
  const { user: currentUser } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!currentUser) {
      toast.error('You must be logged in to rate users');
      return;
    }

    if (tradePartner.id === currentUser.id) {
      toast.error('You cannot rate yourself');
      return;
    }

    setIsSubmitting(true);

    try {
      // Ensure comment is properly handled - empty strings become null
      const trimmedComment = comment.trim();
      
      const ratingData = {
        trade_id: tradeId,
        reviewee_id: tradePartner.id,
        rating: rating,
        comment: trimmedComment.length > 0 ? trimmedComment : null
        
      };
      console.log(comment);
      console.log('Submitting rating:', ratingData);
      console.log('Current user:', currentUser?.id);
      console.log('API base URL:', config.api.baseUrl);
      
      const result = await ratingService.createRating(ratingData);
      console.log('Rating creation result:', result);

      toast.success('Rating submitted successfully!');
      
      // Reset form
      setRating(0);
      setComment('');
      
      // Close modal
      onClose();
      
      // Notify parent component
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }

    } catch (error: any) {
      console.error('Error submitting rating:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Show more specific error messages
      if (error.response?.status === 404) {
        toast.error('Rating API endpoint not found. Please check server configuration.');
      } else if (error.response?.status === 401) {
        toast.error('You must be logged in to submit ratings.');
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Invalid rating data provided.');
      } else {
        toast.error(error.message || 'Failed to submit rating');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setComment('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-400" />
            <span>Rate Your Trade Partner</span>
          </DialogTitle>
          <DialogDescription>
            Share your experience with {tradePartner.name} to help the community
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Trade Partner Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={tradePartner.image} alt={tradePartner.name} />
                  <AvatarFallback>
                    {tradePartner.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{tradePartner.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {tradePartner.loyalty_points || 0} loyalty points
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Trade Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Trade Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Your Item */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm text-muted-foreground">Your Item</h4>
                  <div className="flex space-x-3 p-3 border rounded-lg">
                    <img
                      src={getImageUrl(tradeDetails.myItem.images?.[0]?.url) || '/placeholder.svg'}
                      alt={tradeDetails.myItem.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm">{tradeDetails.myItem.title}</h5>
                      <Badge variant="outline" className="text-xs mt-1">
                        {tradeDetails.myItem.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {tradeDetails.myItem.condition.toLowerCase().replace('_', ' ')} condition
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
                  <h4 className="font-medium text-sm text-muted-foreground">Their Item</h4>
                  <div className="flex space-x-3 p-3 border rounded-lg">
                    <img
                      src={getImageUrl(tradeDetails.theirItem.images?.[0]?.url) || '/placeholder.svg'}
                      alt={tradeDetails.theirItem.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h5 className="font-semibold text-sm">{tradeDetails.theirItem.title}</h5>
                      <Badge variant="outline" className="text-xs mt-1">
                        {tradeDetails.theirItem.category}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {tradeDetails.theirItem.condition.toLowerCase().replace('_', ' ')} condition
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rating Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Rate This Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Star Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">How was your experience?</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-1 rounded transition-colors ${
                        star <= rating
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-muted-foreground hover:text-yellow-300'
                      }`}
                      disabled={isSubmitting}
                    >
                      <Star
                        className={`h-6 w-6 ${
                          star <= rating ? 'fill-yellow-400' : 'fill-transparent'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating === 0 ? 'Select a rating' : 
                     rating === 1 ? 'Poor' :
                     rating === 2 ? 'Fair' :
                     rating === 3 ? 'Good' :
                     rating === 4 ? 'Very Good' : 'Excellent'}
                  </span>
                </div>
              </div>

              {/* Comment */}
              <div className="space-y-2">
                <label htmlFor="comment" className="text-sm font-medium">
                  Share your experience (optional)
                </label>
                <Textarea
                  id="comment"
                  placeholder="Tell others about your trade experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={isSubmitting}
                  className="min-h-[100px]"
                />
              </div>

              {/* Rating Guidelines */}
              <div className="p-3 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium mb-2">Rating Guidelines</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Consider communication, item condition, and timeliness</li>
                  <li>• Be honest but fair in your assessment</li>
                  <li>• Focus on the trade experience, not personal preferences</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitRating}
              disabled={rating === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Star className="h-4 w-4 mr-2" />
                  Submit Rating
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
