
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko, ja, enUS } from "date-fns/locale";
import { useLanguage } from "@/i18n/useLanguage";
import { ChatMessage as ChatMessageType } from "@/utils/chatHelpers";
import { useAuth } from "@/context/AuthContext";

interface ChatMessageProps {
  message: ChatMessageType;
  isCurrentUser?: boolean;
  showOriginal?: boolean;
  isTranslating?: boolean;
}

export function ChatMessage({ message, isCurrentUser, showOriginal = false, isTranslating = false }: ChatMessageProps) {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [showTranslated, setShowTranslated] = useState(!showOriginal);
  
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
    <div className={`my-2 flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
        isCurrentUser 
          ? 'bg-pastel-green text-slate-800' 
          : 'bg-pastel-blue/20 text-slate-800'
      }`}>
        <div className="text-sm">
          {isTranslating && message.translated_content && showTranslated ? (
            <div>
              <p>{message.translated_content}</p>
              <button 
                className="text-xs text-primary underline mt-1"
                onClick={() => setShowTranslated(false)}
              >
                {language === "ko" ? "원문 보기" : "原文を表示"}
              </button>
            </div>
          ) : (
            <div>
              <p>{message.content}</p>
              {isTranslating && message.translated_content && (
                <button 
                  className="text-xs text-primary underline mt-1"
                  onClick={() => setShowTranslated(true)}
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
