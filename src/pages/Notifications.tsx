import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Link } from "react-router-dom";
import { Heart, MessageSquare, CheckCircle, AlertCircle } from "lucide-react";

interface Notification {
  id: string;
  type: "match_accepted" | "match_rejected" | "new_message" | "verify_passed" | "verify_rejected";
  title: string;
  body: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: string;
}

export default function Notifications() {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockNotifications: Notification[] = [
        {
          id: "1",
          type: "match_accepted",
          title: t("notification.match_accepted"),
          body: t("language") === "ko" ? "유카님이 매칭을 수락했습니다." : "ユカさんがマッチングを承認しました。",
          relatedId: "2",
          isRead: false,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "2",
          type: "new_message",
          title: t("notification.new_message"),
          body: t("language") === "ko" ? "유카님이 메시지를 보냈습니다." : "ユカさんがメッセージを送りました。",
          relatedId: "2",
          isRead: false,
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "3",
          type: "verify_passed",
          title: t("notification.verify_passed"),
          body: t("notification.verify_passed_desc") || (t("language") === "ko" ? "본인 인증이 완료되었습니다." : "本人確認が完了しました。"),
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
      setNotifications(mockNotifications);
      setLoading(false);
    }, 1000);
  }, [t]);

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, isRead: true } : notif
      )
    );
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
        return `/chat/${notification.relatedId}`;
      case "new_message":
        return `/chat/${notification.relatedId}`;
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
                  notification.isRead ? "bg-white" : "bg-pastel-mint/10"
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
                        {formatDate(notification.createdAt)}
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
