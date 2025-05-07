
import { supabase } from "@/integrations/supabase/client";

export interface Notification {
  id: string;
  type: "match_accepted" | "match_rejected" | "new_message" | 
        "verify_passed" | "verify_rejected" | "profile_photo_approved" | 
        "profile_photo_rejected" | "profile_photo_request" | "match_request";
  title: string;
  body: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

// Function to get all notifications
export const getUserNotifications = async (): Promise<Notification[]> => {
  try {
    const { data, error } = await supabase.rpc('get_user_notifications', {
      p_user_id: (await supabase.auth.getUser()).data.user?.id
    });
    
    if (error) {
      throw error;
    }
    
    return data as Notification[] || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

// Function to mark a notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('mark_notification_as_read', {
      p_notification_id: notificationId
    });
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return false;
  }
};

// Function to mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('mark_all_notifications_as_read');
    
    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    return false;
  }
};

// Function to get unread notification count
export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const notifications = await getUserNotifications();
    return notifications.filter(notification => !notification.is_read).length;
  } catch (error) {
    console.error("Error getting unread notification count:", error);
    return 0;
  }
};

// Get notification icon based on notification type
export const getNotificationIcon = (type: string) => {
  switch (type) {
    case "match_accepted":
      return "heart";
    case "match_rejected":
      return "heart-off";
    case "new_message":
      return "message-square";
    case "verify_passed":
    case "profile_photo_approved":
      return "check-circle";
    case "verify_rejected":
    case "profile_photo_rejected":
      return "alert-circle";
    case "profile_photo_request":
      return "image";
    case "match_request":
      return "user-plus";
    default:
      return "bell";
  }
};

// Get notification color based on notification type
export const getNotificationColor = (type: string) => {
  switch (type) {
    case "match_accepted":
      return "var(--pastel-pink)";
    case "match_rejected":
      return "var(--pastel-yellow)";
    case "new_message":
      return "var(--pastel-blue)";
    case "verify_passed":
    case "profile_photo_approved":
      return "var(--pastel-green)";
    case "verify_rejected":
    case "profile_photo_rejected":
      return "var(--pastel-lavender)";
    case "profile_photo_request":
      return "var(--pastel-peach)";
    case "match_request":
      return "var(--pastel-pink)";
    default:
      return "var(--pastel-blue)";
  }
};

// Get navigation link for a notification
export const getNotificationLink = (notification: Notification): string => {
  switch (notification.type) {
    case "match_accepted":
      return notification.related_id ? `/chat/${notification.related_id}` : "/chat";
    case "match_rejected":
      return "/matches";
    case "new_message":
      return notification.related_id ? `/chat/${notification.related_id}` : "/chat";
    case "verify_passed":
    case "verify_rejected":
    case "profile_photo_approved":
    case "profile_photo_rejected":
    case "profile_photo_request":
      return "/settings";
    case "match_request":
      return "/match-requests";
    default:
      return "/notifications";
  }
};

// Format the time difference between now and a given date
export const formatTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) {
    return "just now";
  }
  
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} hr ago`;
  }
  
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }
  
  // For older notifications, show the date
  return date.toLocaleDateString();
};
