
import { Bell, User } from "lucide-react";
import { useLanguage } from "@/i18n/useLanguage";
import { Link } from "react-router-dom";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export function Header() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLatestNotifications = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Call our RPC function to get notifications
        const { data, error } = await supabase.rpc(
          'get_user_notifications',
          { p_user_id: user.id }
        );
        
        if (error) throw error;
        
        // Only take the most recent 3 unread notifications
        const recentUnread = (data || [])
          .filter(n => !n.is_read)
          .slice(0, 3);
          
        setNotifications(recentUnread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLatestNotifications();
    
    // Set up a subscription to listen for updates
    // This would be implemented in a real app
    
  }, [user]);
  
  const hasUnreadNotifications = notifications.length > 0;
  
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return t("notifications.time_ago.minutes", { minutes: diffMinutes || 1 });
    } else {
      const diffHours = Math.floor(diffMinutes / 60);
      return t("notifications.time_ago.hours", { hours: diffHours });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/home" className="flex items-center">
            <img 
              src="/lovable-uploads/6bdd8a27-cd91-4f69-bda2-2afe0a4a0cdd.png" 
              alt="Pasar Logo" 
              className="h-8 w-8 mr-2" 
            />
            <span className="text-xl font-bold font-hand">
              {t('app.name')}
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8 items-center">
            <Link to="/home" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <Link to="/matches" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.matches')}
            </Link>
            <Link to="/chat" className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.messages')}
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <LanguageToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                >
                  <Bell className="h-5 w-5" />
                  {hasUnreadNotifications && (
                    <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-white"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 mt-2">
                <div className="px-4 py-3 font-medium border-b">
                  {t('settings.notifications')}
                </div>
                
                {loading ? (
                  <div className="py-4 flex justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : notifications.length > 0 ? (
                  <>
                    {notifications.map(notification => (
                      <DropdownMenuItem key={notification.id} className="py-2 px-4 cursor-pointer">
                        <div>
                          <p className="text-sm font-medium">
                            {notification.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatTimeAgo(notification.created_at)}
                          </p>
                        </div>
                      </DropdownMenuItem>
                    ))}
                  </>
                ) : (
                  <div className="py-4 px-4 text-center text-sm text-muted-foreground">
                    {t('notification.empty')}
                  </div>
                )}
                
                <DropdownMenuItem className="justify-center cursor-pointer">
                  <Link to="/notifications" className="text-sm text-primary">
                    {t('notifications.view_all')}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to="/mypage">
              <div className="h-10 w-10 rounded-full bg-pastel-lavender flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
