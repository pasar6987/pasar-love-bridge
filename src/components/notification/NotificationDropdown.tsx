
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/i18n/useLanguage";
import { 
  getUserNotifications,
  formatTimeAgo, 
  Notification 
} from "@/utils/notificationHelpers";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function NotificationDropdown() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications when the dropdown is opened
  const fetchNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const notifs = await getUserNotifications();
      // Get only the most recent 5 notifications
      const recentNotifs = notifs.slice(0, 5);
      setNotifications(recentNotifs);
      // Count unread notifications
      const unread = notifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast({
        title: t("common.error"),
        description: t("notifications.error.fetch"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to notification changes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh notifications when there are changes
          fetchNotifications();
        }
      )
      .subscribe();

    // Initial fetch
    fetchNotifications();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
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
              <Link 
                key={notification.id} 
                to={notification.related_id ? `/notifications?highlight=${notification.id}` : "/notifications"}
              >
                <DropdownMenuItem className="py-2 px-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">
                      {notification.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(notification.created_at)}
                    </p>
                  </div>
                </DropdownMenuItem>
              </Link>
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
  );
}
