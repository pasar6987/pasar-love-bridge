
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, AlertCircle, Heart, MessageSquare, X } from "lucide-react";
import { 
  Notification, 
  markNotificationAsRead, 
  getNotificationLink,
  getNotificationIcon,
  getNotificationColor,
  formatTimeAgo
} from "@/utils/notificationHelpers";

interface NotificationItemProps {
  notification: Notification;
  onRead?: (id: string) => void;
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const navigate = useNavigate();
  const [isRead, setIsRead] = useState(notification.is_read);
  
  const handleClick = async () => {
    if (!isRead) {
      setIsRead(true);
      await markNotificationAsRead(notification.id);
      if (onRead) {
        onRead(notification.id);
      }
    }
    
    // Navigate to the appropriate page based on notification type
    const link = getNotificationLink(notification);
    navigate(link);
  };

  const getIconComponent = () => {
    switch (notification.type) {
      case "match_accepted":
        return <Heart className="h-5 w-5 text-pastel-pink" />;
      case "match_rejected":
        return <X className="h-5 w-5 text-pastel-yellow" />;
      case "new_message":
        return <MessageSquare className="h-5 w-5 text-pastel-blue" />;
      case "verify_passed":
        return <CheckCircle className="h-5 w-5 text-pastel-green" />;
      case "verify_rejected":
        return <AlertCircle className="h-5 w-5 text-pastel-lavender" />;
      default:
        return null;
    }
  };

  const notificationStyle = isRead ? "bg-white" : "bg-pastel-mint/10";

  return (
    <div 
      className={`p-4 border-b last:border-b-0 cursor-pointer ${notificationStyle} hover:bg-gray-50 transition-colors`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-3">
        <div className="mt-1">
          {getIconComponent()}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className={`${isRead ? 'font-normal' : 'font-medium'}`}>
              {notification.title}
            </h3>
            <span className="text-xs text-muted-foreground">
              {formatTimeAgo(notification.created_at)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {notification.body}
          </p>
        </div>
      </div>
    </div>
  );
}
