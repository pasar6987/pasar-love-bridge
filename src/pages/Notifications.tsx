
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { getUserNotifications, Notification, markAllNotificationsAsRead } from "@/utils/notificationHelpers";
import { NotificationItem } from "@/components/notification/NotificationItem";
import { supabase } from "@/integrations/supabase/client";

export default function Notifications() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch notifications from database
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      setLoading(true);
      try {
        const notificationsData = await getUserNotifications();
        setNotifications(notificationsData);
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

    fetchNotifications();
    
    // Set up real-time subscription for notifications
    if (user) {
      const channel = supabase
        .channel('notification_updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            // Refresh notifications on any changes
            fetchNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [t, user, navigate, toast]);

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update UI optimistically
      setNotifications(prev => prev.map(notif => ({
        ...notif,
        is_read: true
      })));
      toast({
        title: t("notifications.marked_all_read"),
        description: t("notifications.marked_all_read_description")
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      toast({
        title: t("common.error"),
        description: t("notifications.error.mark_read"),
        variant: "destructive"
      });
    }
  };

  const handleNotificationRead = (id: string) => {
    // Update UI optimistically
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, is_read: true } : notif
      )
    );
  };

  // Format date for grouping
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return t("notification.today");
    } else if (diffDays === 1) {
      return t("notification.yesterday");
    } else {
      return date.toLocaleDateString(t("language") === "ko" ? "ko-KR" : "ja-JP", {
        month: "short",
        day: "numeric",
      });
    }
  };

  // Group notifications by date
  const groupedNotifications = notifications.reduce<Record<string, Notification[]>>((acc, notification) => {
    const date = formatDate(notification.created_at);
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(notification);
    return acc;
  }, {});

  // Check if there are any unread notifications
  const hasUnreadNotifications = notifications.some(n => !n.is_read);

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">
            {t("notification.title")}
          </h1>
          {hasUnreadNotifications && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              {t("notification.mark_all_read")}
            </Button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div>
            {Object.entries(groupedNotifications).map(([date, notifs]) => (
              <div key={date} className="mb-6">
                <h2 className="text-sm font-medium text-muted-foreground mb-2 px-1">
                  {date}
                </h2>
                <div className="bg-white rounded-xl border overflow-hidden">
                  {notifs.map((notification) => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification}
                      onRead={handleNotificationRead}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-muted-foreground">
              {t("notification.empty")}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
