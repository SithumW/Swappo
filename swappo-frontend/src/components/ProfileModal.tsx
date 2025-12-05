import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user";
import { ratingService } from "@/services/rating";
import { User, UserProfile, Rating, RatingStats } from "@/types/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  User as UserIcon,
  Star,
  Calendar,
  Trophy,
  Package,
  Handshake,
  MessageSquare,
} from "lucide-react";
import "@/styles/components/ProfileModal.css";

interface ProfileModalProps {
  userId?: string;
  user?: User; // For displaying minimal user data immediately
  trigger?: React.ReactNode;
  isCurrentUser?: boolean;
}

// Badge configuration
const badgeConfig = {
  BRONZE: { 
    label: "Bronze Trader", 
    color: "bg-amber-600",
    icon: "🥉",
    description: "Starting your trading journey"
  },
  SILVER: { 
    label: "Silver Trader", 
    color: "bg-slate-400",
    icon: "🥈", 
    description: "Experienced community member"
  },
  GOLD: { 
    label: "Gold Trader", 
    color: "bg-yellow-500",
    icon: "🥇",
    description: "Trusted and active trader"
  },
  DIAMOND: { 
    label: "Diamond Trader", 
    color: "bg-cyan-400",
    icon: "💎",
    description: "Elite community leader"
  },
  RUBY: { 
    label: "Ruby Trader", 
    color: "bg-red-500",
    icon: "💎",
    description: "Master trader, community champion"
  }
};

const ProfileModal = ({ 
  userId, 
  user, 
  trigger, 
  isCurrentUser = false
}: ProfileModalProps) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ratingStats, setRatingStats] = useState<RatingStats | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Use provided user data or current user if it's the current user
  const displayUser = user || (isCurrentUser ? currentUser : null);
  const profileUserId = userId || displayUser?.id || '';

  const fetchProfileData = async () => {
    if (!profileUserId || isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      let profileData: UserProfile;
      
      if (isCurrentUser) {
        profileData = await userService.getMyProfile();
      } else {
        profileData = await userService.getUserProfile(profileUserId);
      }
      
      setProfile(profileData);

      // Fetch rating stats and individual ratings
      const [stats, userRatings] = await Promise.all([
        userService.getUserRatingStats(profileUserId).catch(err => {
          console.error('Failed to fetch rating stats:', err);
          return null;
        }),
        ratingService.getUserRatings(profileUserId).catch(err => {
          console.error('Failed to fetch user ratings:', err);
          return [];
        })
      ]);
      
      setRatingStats(stats);
      setRatings(userRatings);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfileData();
    }
  }, [isOpen, profileUserId]);

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  const formatReviewDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderBadgeInfo = (badge: string) => {
    const config = badgeConfig[badge as keyof typeof badgeConfig];
    if (!config) return null;

    const badgeColorClass = `badge-${badge.toLowerCase()}`;

    return (
      <div className="profile-badge-info">
        <div className="profile-badge-icon">{config.icon}</div>
        <div className="profile-badge-content">
          <div className="profile-badge-header">
            <Badge className={`profile-badge ${badgeColorClass}`}>
              {config.label}
            </Badge>
          </div>
          <p className="profile-badge-description">{config.description}</p>
        </div>
      </div>
    );
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="profile-default-trigger">
      <Avatar className="profile-default-avatar">
        <AvatarImage src={displayUser?.image} alt={displayUser?.name} />
        <AvatarFallback>
          {displayUser?.name?.slice(0, 2).toUpperCase() || '??'}
        </AvatarFallback>
      </Avatar>
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="profile-modal-content">
        <DialogHeader>
          <DialogTitle className="profile-modal-header">
            <UserIcon className="h-5 w-5" />
            <span>
              {isCurrentUser ? 'Your Profile' : `${displayUser?.name || 'User'}'s Profile`}
            </span>
          </DialogTitle>
          <DialogDescription>
            {isCurrentUser 
              ? 'View and manage your profile information' 
              : 'View user profile and trading history'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="profile-modal-space-y-6">
          {/* Basic Info */}
          <Card>
            <CardContent className="profile-basic-info-card">
              <div className="profile-basic-info-content">
                <Avatar className="profile-avatar-large">
                  <AvatarImage 
                    src={profile?.image || displayUser?.image} 
                    alt={profile?.name || displayUser?.name} 
                  />
                  <AvatarFallback className="profile-avatar-fallback">
                    {(profile?.name || displayUser?.name)?.slice(0, 2).toUpperCase() || '??'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="profile-info-section">
                  <div>
                    <h3 className="profile-name">
                      {isLoading ? (
                        <Skeleton className="profile-skeleton" />
                      ) : (
                        profile?.name || displayUser?.name || 'Unknown User'
                      )}
                    </h3>
                    {(profile?.email || displayUser?.email) && (
                      <p className="profile-email">
                        {profile?.email || displayUser?.email}
                      </p>
                    )}
                  </div>

                  {/* Badge */}
                  {isLoading ? (
                    <Skeleton className="h-12 w-full" />
                  ) : (
                    profile?.badge && renderBadgeInfo(profile.badge)
                  )}

                  {/* Join Date */}
                  {profile?.createdAt && (
                    <div className="profile-join-date">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {formatJoinDate(profile.createdAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              {profile?.bio && (
                <div className="profile-bio">
                  <p className="profile-bio-text">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Trophy className="h-5 w-5 text-warning" />
                <span>Statistics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="profile-stats-grid">
                <div className="profile-stat-card">
                  <div className="profile-stat-icon">
                    <Trophy className="h-5 w-5 text-warning" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="profile-stat-skeleton" />
                  ) : (
                    <div className="profile-stat-value text-warning">
                      {profile?.loyalty_points || displayUser?.loyalty_points || 0}
                    </div>
                  )}
                  <div className="profile-stat-label">Points</div>
                </div>

                <div className="profile-stat-card">
                  <div className="profile-stat-icon">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="profile-stat-skeleton" />
                  ) : (
                    <div className="profile-stat-value text-primary">
                      {profile?._count?.items || 0}
                    </div>
                  )}
                  <div className="profile-stat-label">Items</div>
                </div>

                <div className="profile-stat-card">
                  <div className="profile-stat-icon">
                    <Handshake className="h-5 w-5 text-success" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="profile-stat-skeleton" />
                  ) : (
                    <div className="profile-stat-value text-success">
                      {profile?._count?.trades || 0}
                    </div>
                  )}
                  <div className="profile-stat-label">Trades</div>
                </div>

                <div className="profile-stat-card">
                  <div className="profile-stat-icon">
                    <MessageSquare className="h-5 w-5 text-info" />
                  </div>
                  {isLoading ? (
                    <Skeleton className="profile-stat-skeleton" />
                  ) : (
                    <div className="profile-stat-value text-info">
                      {ratingStats?.received?.total || ratings?.length || 0}
                    </div>
                  )}
                  <div className="profile-stat-label">Reviews</div>
                </div>
              </div>

              {/* Rating Distribution */}
              {ratingStats && ratingStats.received && ratingStats.received.total > 0 && (
                <div className="mt-6">
                  <h4 className="text-sm font-medium mb-3">Rating Breakdown</h4>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const ratingData = ratingStats.received.distribution?.find(d => d.rating === rating);
                      const count = ratingData?.count || 0;
                      const percentage = (ratingStats.received.total || 0) > 0 
                        ? (count / (ratingStats.received.total || 1)) * 100 
                        : 0;
                      
                      return (
                        <div key={rating} className="flex items-center space-x-2 text-sm">
                          <span className="w-2">{rating}</span>
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="h-full bg-yellow-400 transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-muted-foreground">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Based on {ratingStats.received.total} review{ratingStats.received.total !== 1 ? 's' : ''}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Reviews Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <MessageSquare className="h-5 w-5 text-info" />
                <span>Reviews</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16 ml-auto" />
                      </div>
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : ratings && ratings.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  <div className="mb-4 text-sm text-muted-foreground">
                    Showing {ratings.length} review{ratings.length !== 1 ? 's' : ''}
                  </div>
                  {ratings.map((rating) => (
                    <div key={rating.id} className="border-b border-muted pb-4 last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={rating.reviewer.image} alt={rating.reviewer.name} />
                            <AvatarFallback>
                              {rating.reviewer.name?.slice(0, 2).toUpperCase() || '??'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{rating.reviewer.name}</p>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${
                                    star <= rating.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-muted-foreground'
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-1">
                                ({rating.rating}/5)
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {formatReviewDate(rating.created_at)}
                        </p>
                      </div>

                      {rating.comment && rating.comment.trim() !== '' ? (
                        <p className="text-sm text-muted-foreground ml-10 italic">
                          "{rating.comment}"
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground ml-10 opacity-60">
                          No comment provided
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                  <p className="text-muted-foreground text-sm">
                    {isCurrentUser 
                      ? 'Complete trades to receive your first review' 
                      : 'This user hasn\'t received any reviews yet'
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Error State */}
          {error && (
            <Card className="border-destructive">
              <CardContent className="p-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchProfileData}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;
