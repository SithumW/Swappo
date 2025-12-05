import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileModal from "@/components/ProfileModal";
import { 
  LogOut, 
  Plus, 
  Search, 
  Menu,
  X,
  Recycle,
  ArrowRightLeft
} from "lucide-react";
import "@/styles/components/Header.css";

interface HeaderProps {
  user?: {
    id: string; // Add user ID
    name: string;
    avatar?: string;
    badge: "bronze" | "silver" | "gold" | "diamond" | "ruby";
    points: number;
  };
  onLoginClick?: () => void;
  onLogoutClick?: () => void;
  onPostItemClick?: () => void;
  onMyItemsClick?: () => void;
  onMyTradesClick?: () => void;
}

const badgeConfig = {
  bronze: { label: "Bronze Trader", color: "badge-bronze" },
  silver: { label: "Silver Trader", color: "badge-silver" },
  gold: { label: "Gold Trader", color: "badge-gold" },
  diamond: { label: "Diamond Trader", color: "badge-diamond" },
  ruby: { label: "Ruby Trader", color: "badge-ruby" }
};

export const Header = ({ 
  user, 
  onLoginClick, 
  onLogoutClick, 
  onPostItemClick, 
  onMyItemsClick, 
  onMyTradesClick 
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div className="logo-section">
          <div className="logo-icon">
             <img src="/icons/logohome.png" alt="Recycle Icon" className="header-icon" />
          </div>
          <span className="logo-text"></span>
        </div>

      

        {/* Desktop Actions */}
        <div className="desktop-actions ">
          {user && (
            <>
              <Button
                onClick={onPostItemClick}
                variant="default"
                size="sm"
                className="post-item-btn"
              >
                <Plus className="h-4 w-4 mr-2" />
                Post Item
              </Button>

              <Button
                onClick={onMyTradesClick}
                variant="outline"
                size="sm"
                className="my-trades-btn"
              >
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                My Trades
              </Button>

              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <span className="user-name">{user.name}</span>
                    <Badge variant="default" className={`${badgeConfig[user.badge].color} text-white`}>
                      {badgeConfig[user.badge].label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">{user.points} points</div>
                </div>
                
                <ProfileModal 
                  userId={user.id}
                  isCurrentUser={true}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-auto p-1 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/icons/user.png" alt={user.name} />
                        <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
                
                <Button onClick={onLogoutClick} variant="ghost" size="sm" className="hover:scale-110 hover:bg-transparent transition">
                  <img 
                    src="/icons/exit.png"  alt="Logout" className="logout-icon"
                  />
                </Button>
              </div>
            </>
          
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-4">
          {/* Mobile Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Search items..."
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {user ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <ProfileModal 
                  userId={user.id}
                  isCurrentUser={true}
                  trigger={
                    <Button variant="ghost" size="sm" className="h-auto p-1 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  }
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{user.name}</span>
                    <Badge variant="secondary" className={`${badgeConfig[user.badge].color} text-white text-xs`}>
                      {badgeConfig[user.badge].label}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">{user.points} points</div>
                </div>
              </div>
              
              <Button onClick={onPostItemClick} variant="default" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Post Item
              </Button>
              
              <Button onClick={onMyTradesClick} variant="outline" className="w-full">
                <ArrowRightLeft className="h-4 w-4 mr-2" />
                My Trades
              </Button>
              
              <Button onClick={onLogoutClick} variant="outline" className="w-full">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          ) : (
            <Button onClick={onLoginClick} variant="default" className="w-full">
              Login
            </Button>
          )}
        </div>
      )}
    </header>
  );
};