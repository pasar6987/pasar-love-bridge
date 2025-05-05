
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/useLanguage";
import { Send, Lightbulb, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  senderId: string;
  content: string;
  translatedContent?: string;
  timestamp: string;
  type: "user" | "icebreaker" | "topic";
}

interface ChatBoxProps {
  chatPartner: {
    id: string;
    name: string;
    photo: string;
  };
  userId: string;
  matchId?: string;
}

export function ChatBox({ chatPartner, userId, matchId }: ChatBoxProps) {
  const { t, language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [translating, setTranslating] = useState<Record<string, boolean>>({});
  const [showTranslation, setShowTranslation] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Load messages from database
  useEffect(() => {
    const loadMessages = async () => {
      if (!matchId) return;
      
      try {
        // For now, use mock data
        // In production, this would fetch from the chat_messages table
        setTimeout(() => {
          const initialMessages: Message[] = [
            {
              id: "1",
              senderId: chatPartner.id,
              content: language === "ko" ? "안녕하세요! 반가워요 :)" : "こんにちは！よろしくお願いします :)",
              translatedContent: language === "ko" ? "こんにちは！よろしくお願いします :)" : "안녕하세요! 반가워요 :)",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              type: "user"
            }
          ];
          setMessages(initialMessages);
        }, 500);
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };
    
    loadMessages();
  }, [chatPartner.id, language, matchId]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const newMsg: Message = {
      id: Date.now().toString(),
      senderId: userId,
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: "user"
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage("");
    
    try {
      if (matchId) {
        // In production, this would insert into the chat_messages table
        console.log("Sending message to database:", {
          match_id: matchId,
          sender_id: userId,
          content: newMessage
        });
      }
      
      // Simulate a response
      setTimeout(() => {
        const responseMsg: Message = {
          id: (Date.now() + 1).toString(),
          senderId: chatPartner.id,
          content: language === "ko" 
            ? "네, 저도 반가워요! 취미가 뭐예요?" 
            : "はい、私も嬉しいです！趣味は何ですか？",
          translatedContent: null, // Will be populated on demand
          timestamp: new Date().toISOString(),
          type: "user"
        };
        
        setMessages(prev => [...prev, responseMsg]);
      }, 2000);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString(language === "ko" ? "ko-KR" : "ja-JP", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };
  
  const useIceBreaker = () => {
    const icebreakerMsg: Message = {
      id: Date.now().toString(),
      senderId: "system",
      content: language === "ko" 
        ? "당신의 버킷리스트에 있는 일 중 하나는 무엇인가요?" 
        : "あなたのバケットリストの中から一つ教えてください。",
      timestamp: new Date().toISOString(),
      type: "icebreaker"
    };
    
    setMessages([...messages, icebreakerMsg]);
  };
  
  const useRandomTopic = () => {
    const topics = {
      ko: [
        "좋아하는 여행지는 어디인가요?",
        "가장 좋아하는 음식은 무엇인가요?",
        "어린 시절 가장 좋아했던 추억은 무엇인가요?",
        "최근에 본 영화나 드라마 중 추천하고 싶은 것은 무엇인가요?"
      ],
      ja: [
        "お気に入りの旅行先はどこですか？",
        "一番好きな食べ物は何ですか？",
        "子供の頃の一番楽しかった思い出は何ですか？",
        "最近見た映画やドラマでおすすめのものは何ですか？"
      ]
    };
    
    const randomTopic = topics[language][Math.floor(Math.random() * topics[language].length)];
    
    const topicMsg: Message = {
      id: Date.now().toString(),
      senderId: "system",
      content: randomTopic,
      timestamp: new Date().toISOString(),
      type: "topic"
    };
    
    setMessages([...messages, topicMsg]);
  };
  
  const handleTranslate = async (messageId: string, content: string) => {
    setTranslating(prev => ({ ...prev, [messageId]: true }));
    
    try {
      // In production, this would call a real translation API
      // For now, simulate translation with a delay
      
      // The target language depends on the current language
      const targetLanguage = language === "ko" ? "ja" : "ko";
      
      const simulateTranslation = () => {
        // Basic simulation of translation
        let translatedText = "";
        if (language === "ko") {
          // Simulate Japanese translation
          translatedText = "これは" + content.length + "文字のテキストの翻訳です。";
        } else {
          // Simulate Korean translation
          translatedText = "이것은 " + content.length + "자의 텍스트 번역입니다.";
        }
        
        return translatedText;
      };
      
      setTimeout(() => {
        const translatedText = simulateTranslation();
        
        // Update the message with translation
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId 
              ? { ...msg, translatedContent: translatedText }
              : msg
          )
        );
        
        setTranslating(prev => ({ ...prev, [messageId]: false }));
        setShowTranslation(prev => ({ ...prev, [messageId]: true }));
      }, 1000);
    } catch (error) {
      console.error("Translation error:", error);
      setTranslating(prev => ({ ...prev, [messageId]: false }));
    }
  };
  
  const toggleTranslation = (messageId: string) => {
    setShowTranslation(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };
  
  const getMessageClasses = (message: Message) => {
    if (message.type === "icebreaker" || message.type === "topic") {
      return "bg-pastel-lavender/20 text-center mx-auto max-w-md";
    }
    
    return message.senderId === userId
      ? "bg-primary text-primary-foreground ml-auto"
      : "bg-secondary mr-auto";
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className="flex flex-col">
            <div
              className={`rounded-2xl p-3 max-w-[70%] ${getMessageClasses(message)}`}
            >
              <p>
                {showTranslation[message.id] && message.translatedContent 
                  ? message.translatedContent 
                  : message.content}
              </p>
              
              {/* Only show translate button for user messages from the other person */}
              {message.type === "user" && message.senderId !== userId && (
                <button
                  onClick={() => {
                    if (message.translatedContent) {
                      toggleTranslation(message.id);
                    } else {
                      handleTranslate(message.id, message.content);
                    }
                  }}
                  className="text-xs opacity-70 hover:opacity-100 mt-1 flex items-center justify-end ml-auto"
                  disabled={translating[message.id]}
                >
                  <Globe className="h-3 w-3 mr-1" />
                  {translating[message.id] 
                    ? (language === "ko" ? "번역 중..." : "翻訳中...")
                    : message.translatedContent
                      ? (showTranslation[message.id] 
                          ? (language === "ko" ? "원본 보기" : "原文を表示") 
                          : (language === "ko" ? "번역 보기" : "翻訳を表示"))
                      : (language === "ko" ? "번역하기" : "翻訳する")}
                </button>
              )}
            </div>
            <span className="text-xs text-muted-foreground mt-1 mx-2">
              {formatMessageTime(message.timestamp)}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2 mb-3">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={useIceBreaker}
            className="text-muted-foreground"
          >
            <Lightbulb className="h-4 w-4 mr-1" />
            {t("chat.icebreaker")}
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={useRandomTopic}
            className="text-muted-foreground"
          >
            <span className="mr-1">🎲</span>
            {t("chat.randomTopic")}
          </Button>
        </div>
        
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={t("chat.writeMessage")}
            className="pasar-input flex-1"
          />
          <Button type="submit" size="icon" className="rounded-full bg-primary h-10 w-10">
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
