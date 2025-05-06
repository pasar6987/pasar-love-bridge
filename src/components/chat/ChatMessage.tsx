
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko, ja, enUS } from "date-fns/locale";
import { useLanguage } from "@/i18n/useLanguage";
import { ChatMessage as ChatMessageType } from "@/utils/chatHelpers";
import { useAuth } from "@/context/AuthContext";

interface ChatMessageProps {
  message: ChatMessageType;
  showTranslation: boolean;
}

export function ChatMessage({ message, showTranslation }: ChatMessageProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [showOriginal, setShowOriginal] = useState(false);
  
  const isMyMessage = message.sender_id === user?.id;
  const isIcebreaker = message.is_icebreaker;
  
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      return "";
    }
  };
  
  // For system messages (icebreakers)
  if (isIcebreaker) {
    return (
      <div className="my-4 flex justify-center">
        <div className="inline-block px-4 py-2 max-w-[85%] bg-pastel-yellow/20 rounded-lg">
          <div className="text-sm text-center">
            {message.content}
          </div>
        </div>
      </div>
    );
  }
  
  // Regular messages
  return (
    <div className={`my-2 flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
        isMyMessage 
          ? 'bg-pastel-green text-slate-800' 
          : 'bg-pastel-blue/20 text-slate-800'
      }`}>
        <div className="text-sm">
          {showTranslation && message.translated_content && !showOriginal ? (
            <div>
              <p>{message.translated_content}</p>
              <button 
                className="text-xs text-primary underline mt-1"
                onClick={() => setShowOriginal(true)}
              >
                {language === "ko" ? "원문 보기" : "原文を表示"}
              </button>
            </div>
          ) : (
            <div>
              <p>{message.content}</p>
              {showTranslation && message.translated_content && (
                <button 
                  className="text-xs text-primary underline mt-1"
                  onClick={() => setShowOriginal(false)}
                >
                  {language === "ko" ? "번역 보기" : "翻訳を表示"}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="text-right">
          <span className="text-xs opacity-70">{formatTime(message.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
