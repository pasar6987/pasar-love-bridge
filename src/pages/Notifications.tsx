
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  type: "match_accepted" | "match_rejected" | "new_message" | "verify_passed" | "verify_rejected";
  title: string;
  body: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

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
        // Use the RPC function we created
        const { data, error } = await supabase.rpc(
          'get_user_notifications', 
          { p_user_id: user.id }
        );
        
        if (error) {
          throw error;
        }
        
        // Type casting to ensure the data matches our Notification interface
        const typedNotifications = (data || []).map(item => ({
          ...item,
          type: item.type as "match_accepted" | "match_rejected" | "new_message" | "verify_passed" | "verify_rejected"
        }));
        
        setNotifications(typedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
        toast({
          title: t("common.error"),
          description: t("common.tryAgain"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [t, user, navigate, toast]);

  const markAsRead = async (id: string) => {
    try {
      // Use the RPC function to mark notification as read
      const { error } = await supabase.rpc(
        'mark_notification_as_read',
        { p_notification_id: id }
      );
      
      if (error) {
        throw error;
      }

      // Update local state to reflect the change
      setNotifications(
        notifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Today
      return date.toLocaleTimeString(t("language") === "ko" ? "ko-KR" : "ja-JP", {
        hour: "numeric",
        minute: "numeric",
      });
    } else if (diffDays === 1) {
      // Yesterday
      return t("notification.yesterday");
    } else {
      // Other days
      return date.toLocaleDateString(t("language") === "ko" ? "ko-KR" : "ja-JP", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "match_accepted":
        return <Heart className="h-5 w-5 text-primary" />;
      case "match_rejected":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      case "new_message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case "verify_passed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "verify_rejected":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return null;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.type) {
      case "match_accepted":
        return `/chat/${notification.related_id}`;
      case "new_message":
        return `/chat/${notification.related_id}`;
      case "verify_passed":
      case "verify_rejected":
        return "/settings";
      default:
        return "#";
    }
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">
          {t("notification.title")}
        </h1>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                to={getNotificationLink(notification)}
                className={`block p-4 rounded-xl border ${
                  notification.is_read ? "bg-white" : "bg-pastel-mint/10"
                } hover:bg-gray-50 transition-colors`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{notification.title}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.body}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 pasar-card">
            <p className="text-muted-foreground">
              {t("notification.empty")}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
