
import { useLanguage } from "@/i18n/useLanguage";

// Format date for showing in notifications
export const useFormatDate = () => {
  const { language } = useLanguage();
  
  const formatNotificationDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      
      // Less than a minute ago
      if (diffMinutes < 1) {
        return language === "ko" ? "방금 전" : "たった今";
      }
      
      // Less than an hour ago
      if (diffMinutes < 60) {
        return language === "ko" 
          ? `${diffMinutes}분 전` 
          : `${diffMinutes}分前`;
      }
      
      // Less than a day ago
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) {
        return language === "ko" 
          ? `${diffHours}시간 전` 
          : `${diffHours}時間前`;
      }
      
      // Yesterday
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) {
        return language === "ko" ? "어제" : "昨日";
      }
      
      // Within a week
      if (diffDays < 7) {
        return language === "ko" 
          ? `${diffDays}일 전` 
          : `${diffDays}日前`;
      }
      
      // Older than a week
      return date.toLocaleDateString(language === "ko" ? "ko-KR" : "ja-JP", {
        month: "short",
        day: "numeric",
      });
    } catch (error) {
      return "";
    }
  };
  
  return {
    formatNotificationDate
  };
};
