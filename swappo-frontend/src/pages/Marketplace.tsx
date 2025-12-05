import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useItems, useItemsByUser } from "@/hooks/useItems";
import { Header } from "@/components/Header";
import "@/styles/pages/Marketplace.css";
import { ItemCard } from "@/components/ItemCard";
import { PostItemModal } from "@/components/PostItemModal";
import { MyItemsModal } from "@/components/MyItemsModal";
import { MyTradesModal } from "@/components/MyTradesModal";
import { ItemDetailsModal } from "@/components/ItemDetailsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Plus, Grid3X3, List, Package } from "lucide-react";
import { toast } from "sonner";
import { formatLocation, generateAvatar } from "@/utils/helpers";
import { calculateDistance, formatDistance } from "@/utils/location";
import { getImageUrl } from "@/config/env";

const categories = ["All", "Electronics", "Furniture", "Clothing", "Books", "Sports & Fitness", "Home & Garden", "Toys & Games"];

export const Marketplace = () => {
  const { user, logout, userLocation, hasLocation } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isMyItemsModalOpen, setIsMyItemsModalOpen] = useState(false);
  const [isMyTradesModalOpen, setIsMyTradesModalOpen] = useState(false);
  const [selectedItemForDetails, setSelectedItemForDetails] = useState<any>(null);
  const [isItemDetailsModalOpen, setIsItemDetailsModalOpen] = useState(false);

  const { data: items = [], isLoading: itemsLoading, error: itemsError } = useItems({
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: searchTerm.trim() || undefined,
  });

  const { data: userItemsData } = useItemsByUser(user?.id || '');

  useEffect(() => {
    console.log('Marketplace useEffect triggered', { userId: user?.id, userLoaded: !!user });
    // ProfileModal now handles its own data fetching
  }, [user?.id]); // Dependency on user.id to trigger when user loads

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleTradeRequest = (itemId: string) => {
    toast.info("Trade request feature coming soon!");
  };

  const handleMoreInfo = (displayItem: any) => {
    const apiItem = items.find(item => item.id === displayItem.id);
    if (!apiItem) return;

    const transformedItem = {
      id: apiItem.id,
      title: apiItem.title,
      description: apiItem.description,
      category: apiItem.category,
      condition: (apiItem.condition || 'GOOD').toLowerCase(),
      images: apiItem.images?.map(img => getImageUrl(img.url)) || [],
      location: displayItem.location,
      postedAt: apiItem.posted_at,
      latitude: apiItem.latitude,
      longitude: apiItem.longitude,
      user: {
        id: apiItem.user.id,
        name: apiItem.user.name,
        image: apiItem.user.image || generateAvatar(apiItem.user.name || ''),
        email: apiItem.user.email || '',
        badge: (apiItem.user.badge || 'BRONZE').toUpperCase(),
        rating: 4.5
      },
      tradeRequests: apiItem._count?.trade_requests_for || 0
    };

    setSelectedItemForDetails(transformedItem);
    setIsItemDetailsModalOpen(true);
  };

  const handlePostItem = () => {
    setIsPostModalOpen(true);
  };

  const handleMyTrades = () => {
    setIsMyTradesModalOpen(true);
  };

  const handlePostSuccess = () => {
    // Refresh items list after successful post
    // The useItems hook should automatically refetch via query invalidation
  };

  const handleSearch = (value: string) => setSearchTerm(value);

  const myItemsCount = userItemsData?.items?.filter(item => item.status !== 'SWAPPED').length || 0;

  const filteredItems = items.filter(item => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      (item.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'newest': return new Date(b.posted_at).getTime() - new Date(a.posted_at).getTime();
      case 'oldest': return new Date(a.posted_at).getTime() - new Date(b.posted_at).getTime();
      case 'popular': return (b._count?.trade_requests_for || 0) - (a._count?.trade_requests_for || 0);
      case 'distance':
        if (!userLocation) return 0;
        const distanceA = calculateDistance(userLocation.latitude, userLocation.longitude, a.latitude, a.longitude);
        const distanceB = calculateDistance(userLocation.latitude, userLocation.longitude, b.latitude, b.longitude);
        return distanceA - distanceB;
      default: return 0;
    }
  });

  if (itemsError) toast.error("Failed to load items. Please try again.");

  return (
    <div className="marketplace">
      <Header 
        user={user ? {
          id: user.id,
          name: user.name || 'Unknown User',
          avatar: user.image || generateAvatar(user.email || ''),
          badge: (user.badge || 'BRONZE').toLowerCase() as any,
          points: user.loyalty_points || 0
        } : undefined} 
        onLogoutClick={handleLogout}
        onPostItemClick={handlePostItem}
        onMyTradesClick={handleMyTrades}
      />

      <main className="marketplace-main">
        <div className="welcome-section">
          <h1>Welcome back, {user?.name || 'Trader'}! 👋</h1>
          <p>Discover amazing items from your community and find your next treasure.</p>
        </div>

        <Card className="filters-card">
          <CardContent>
            <div className="filters-container">
              <div className="filters-left">
                

                <div className="filter-group">
                  <label>Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                

                <div className="filter-group">
                  <label>Sort by</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>

                      {hasLocation && <SelectItem value="distance">Nearest First</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>

                <div className="filter-group">
                  <label>Search</label>
                 <Input className="search-input" placeholder="Search items..." value={searchTerm} onChange={(e) => handleSearch(e.target.value)} />

                </div>

              </div>

              <div className="filters-right">
                <div className="view-mode-buttons">
                  <Button variant={viewMode === "grid" ? "secondary" : "ghost"} onClick={() => setViewMode("grid")}><Grid3X3 /></Button>
                  <Button variant={viewMode === "list" ? "secondary" : "ghost"} onClick={() => setViewMode("list")}><List /></Button>
                </div>

                <div className="action-buttons">
                  <Button onClick={() => setIsMyItemsModalOpen(true)} variant="outline">
                    <Package /> My Items ({myItemsCount})
                  </Button>
                  {/*
                  <Button onClick={handlePostItem}>
                    <Plus /> Post Item
                  </Button>*/}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {itemsLoading && <div className="loading-state">Loading items...</div>}

        {!itemsLoading && (
          <div className={`items-grid ${viewMode}`}>
            {sortedItems.map(item => {
              let locationDisplay = formatLocation(item.latitude, item.longitude);
              if (userLocation && hasLocation) {
                const distance = calculateDistance(userLocation.latitude, userLocation.longitude, item.latitude, item.longitude);
                locationDisplay = formatDistance(distance);
              }

              return (
                <ItemCard
                  key={item.id}
                  item={{
                    id: item.id,
                    title: item.title,
                    description: item.description,
                    category: item.category,
                    condition: (item.condition || 'GOOD').toLowerCase() as any,
                    images: item.images?.map(img => getImageUrl(img.url)) || [],
                    location: locationDisplay,
                    postedAt: item.posted_at,
                    owner: {
                      id: item.user.id,
                      name: item.user.name,
                      avatar: item.user.image || "/icons/user.png",
                      badge: (item.user.badge || 'BRONZE').toLowerCase() as any,
                      rating: 4.5
                    },
                    tradeRequests: item._count?.trade_requests_for || 0
                  }}
                  onMoreInfo={handleMoreInfo}
                  onFavorite={handleFavorite}
                  isFavorited={favorites.includes(item.id)}
                />
              );
            })}
          </div>
        )}

        {!itemsLoading && sortedItems.length === 0 && (
          <Card className="empty-state-card">
            <CardContent>
              <Filter />
              <h3>No items found</h3>
              <p>{searchTerm ? `No items match your search "${searchTerm}".` : "Try adjusting your filters or check back later."}</p>
              <Button onClick={() => { setSelectedCategory("All"); setSearchTerm(""); }} variant="outline">Clear Filters</Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* ✅ Social Footer Section */}
      <footer>
        <div className="footer">
          <div className="topBar">
            <div className="bottomlogo">
              <img src="/icons/logohome.png" alt="SWA PPO Logo" className="swappoImage" />
            </div>

            <div className="bottomHead">
              <a  className="footer-legal-links2">About Us</a>
              <a  className="footer-legal-links2">Contact Us</a>
              <a  className="footer-legal-links2">Help Center</a>
              <a  className="footer-legal-links2">Follow On</a>

              <div className="socialicon"> 
                <img src="icons/so/in.png" alt="LinkedIn" />
                <img src="icons/so/fb.png" alt="Facebook" />
                <img src="icons/so/tw.png" alt="Twitter" />
                <img src="icons/so/ins.png" alt="Instagram" />
              </div>
            </div>
          </div>

          <hr className="footer-hr" />

          <div className="bottomBar">
            <div className="bottomContent">
              
              <div>
                <p>Copyright 2025 © Swappo</p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <PostItemModal isOpen={isPostModalOpen} onClose={() => setIsPostModalOpen(false)} onSuccess={handlePostSuccess} />
      <MyItemsModal isOpen={isMyItemsModalOpen} onClose={() => setIsMyItemsModalOpen(false)} />
      <MyTradesModal isOpen={isMyTradesModalOpen} onClose={() => setIsMyTradesModalOpen(false)} onViewItem={handleMoreInfo} />
      <ItemDetailsModal isOpen={isItemDetailsModalOpen} onClose={() => setIsItemDetailsModalOpen(false)} item={selectedItemForDetails} />
    </div>
  );
};
