
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/useLanguage";
import { Link } from "react-router-dom";

interface MatchData {
  id: string;
  name: string;
  age: number;
  photo: string;
  matchDate: string;
  status: "pending" | "accepted" | "rejected";
}

interface MatchCardProps {
  match: MatchData;
  type: "sent" | "received";
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
}

export function MatchCard({ match, type, onAccept, onReject }: MatchCardProps) {
  const { t, language } = useLanguage();
  const [status, setStatus] = useState(match.status);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleAccept = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStatus("accepted");
      setIsLoading(false);
      if (onAccept) onAccept(match.id);
    }, 500);
  };
  
  const handleReject = () => {
    setIsLoading(true);
    setTimeout(() => {
      setStatus("rejected");
      setIsLoading(false);
      if (onReject) onReject(match.id);
    }, 500);
  };
  
  return (
    <div className="pasar-card flex flex-col sm:flex-row items-center gap-4">
      <Link to={`/profile/${match.id}`}>
        <div className="w-20 h-20 rounded-full overflow-hidden">
          <img
            src={match.photo}
            alt={match.name}
            className="w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="flex-1 text-center sm:text-left">
        <Link to={`/profile/${match.id}`} className="hover:underline">
          <h3 className="font-medium">{match.name}, {match.age}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          {language === "ko" 
            ? `${type === "sent" ? "보낸" : "받은"} 날짜: ${match.matchDate}`
            : `${type === "sent" ? "送信" : "受信"}日: ${match.matchDate}`}
        </p>
      </div>
      
      {type === "received" && status === "pending" && (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleReject}
            disabled={isLoading}
            className="rounded-full border-gray-300"
          >
            {language === "ko" ? "거절" : "拒否"}
          </Button>
          <Button
            size="sm"
            onClick={handleAccept}
            disabled={isLoading}
            className="pasar-btn py-1 px-4"
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : (
              language === "ko" ? "수락" : "承認"
            )}
          </Button>
        </div>
      )}
      
      {(status === "accepted" || (type === "sent" && status === "pending")) && (
        <Link to={`/chat/${match.id}`}>
          <Button size="sm" className="pasar-btn py-1 px-4">
            {language === "ko" ? "채팅하기" : "チャット"}
          </Button>
        </Link>
      )}
      
      {status === "rejected" && (
        <span className="text-sm text-muted-foreground">
          {language === "ko" ? "거절됨" : "拒否されました"}
        </span>
      )}
    </div>
  );
}
