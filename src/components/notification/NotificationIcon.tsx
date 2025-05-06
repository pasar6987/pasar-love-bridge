
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { getUnreadNotificationCount } from "@/utils/notificationHelpers";

export function NotificationIcon() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [unreadCount, setUnreadCount] = useState(0);

  // Get unread notifications count on initial load
  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      };
      
      fetchUnreadCount();
    }
  }, [user]);

  // Set up real-time subscription for notifications
  useEffect(() => {
    if (!user) return;

    // Subscribe to changes on the notifications table
    const channel = supabase
      .channel('notification_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Update the unread count
          setUnreadCount(prevCount => prevCount + 1);
          
          // Show a toast notification
          const notification = payload.new as any;
          toast({
            title: notification.title,
            description: notification.body,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        () => {
          // Refresh unread count when notifications are updated (marked as read)
          getUnreadNotificationCount().then(setUnreadCount);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast]);

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" className="relative rounded-full">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span 
            className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-white"
            aria-label={`${unreadCount} unread notifications`}
          ></span>
        )}
      </Button>
    </div>
  );
}
