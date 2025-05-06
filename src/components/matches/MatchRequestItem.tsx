
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLanguage } from "@/i18n/useLanguage";
import { formatDistanceToNow } from "date-fns";
import { ko, ja, enUS } from 'date-fns/locale';
import { acceptMatchRequest, rejectMatchRequest } from "@/utils/matchHelpers";
import { useToast } from "@/hooks/use-toast";

interface MatchRequestProfile {
  id: string;
  name: string;
  photo?: string;
}

interface MatchRequestProps {
  id: string;
  profile: MatchRequestProfile;
  requestedAt: string;
  status?: 'pending' | 'accepted' | 'rejected';
  type: "sent" | "received";
  onAction?: (id: string, action: 'accept' | 'reject') => void;
}

export function MatchRequestItem({
  id,
  profile,
  requestedAt,
  status = 'pending',
  type,
  onAction
}: MatchRequestProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);
  
  const locale = language === 'ko' ? ko : language === 'ja' ? ja : enUS;
  const timeAgo = formatDistanceToNow(new Date(requestedAt), { 
    addSuffix: true,
    locale
  });

  const handleAccept = async () => {
    try {
      setIsLoading(true);
      await acceptMatchRequest(id);
      setCurrentStatus('accepted');
      toast({
        title: language === "ko" ? "매칭 수락" : "マッチング承認",
        description: language === "ko" ? "채팅이 가능해졌습니다." : "チャットが可能になりました。"
      });
      if (onAction) onAction(id, 'accept');
    } catch (error) {
      console.error("Error accepting match request:", error);
      toast({
        title: language === "ko" ? "오류" : "エラー",
        description: language === "ko" ? "다시 시도해주세요." : "もう一度お試しください。",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleReject = async () => {
    try {
      setIsLoading(true);
      await rejectMatchRequest(id);
      setCurrentStatus('rejected');
      toast({
        title: language === "ko" ? "매칭 거절" : "マッチング拒否",
        description: language === "ko" ? "매칭 요청을 거절했습니다." : "マッチングリクエストを拒否しました。"
      });
      if (onAction) onAction(id, 'reject');
    } catch (error) {
      console.error("Error rejecting match request:", error);
      toast({
        title: language === "ko" ? "오류" : "エラー",
        description: language === "ko" ? "다시 시도해주세요." : "もう一度お試しください。",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pasar-card flex items-center gap-3 p-4">
      <Link to={`/profile/${profile.id}`}>
        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100">
          <img
            src={profile.photo || "/placeholder.svg"}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="flex-1">
        <Link to={`/profile/${profile.id}`} className="hover:underline">
          <h3 className="font-medium text-lg">{profile.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          {language === "ko" 
            ? `${type === "sent" ? "보낸" : "받은"} 요청: ${timeAgo}`
            : `${type === "sent" ? "送信" : "受信"}リクエスト: ${timeAgo}`}
        </p>
      </div>
      
      {type === "received" && currentStatus === "pending" && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReject}
            disabled={isLoading}
            className="border-pink-100 text-pink-500 hover:bg-pink-50 hover:text-pink-600"
          >
            {language === "ko" ? "거절" : "拒否"}
          </Button>
          <Button
            onClick={handleAccept}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <span className="h-4 w-4 block rounded-full border-2 border-white border-t-transparent animate-spin"></span>
            ) : (
              language === "ko" ? "수락" : "承認"
            )}
          </Button>
        </div>
      )}
      
      {currentStatus === "accepted" && (
        <Link to={`/chat`}>
          <Button>
            {language === "ko" ? "채팅하기" : "チャット"}
          </Button>
        </Link>
      )}
      
      {type === "sent" && currentStatus === "pending" && (
        <span className="text-sm bg-gray-100 px-2 py-1 rounded-full">
          {language === "ko" ? "대기중" : "保留中"}
        </span>
      )}
      
      {currentStatus === "rejected" && (
        <span className="text-sm text-muted-foreground">
          {language === "ko" ? "거절됨" : "拒否されました"}
        </span>
      )}
    </div>
  );
}
