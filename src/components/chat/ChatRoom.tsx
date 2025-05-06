
import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/i18n/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  getChatMessages, 
  sendChatMessage,
  markMessagesAsRead,
  generateRandomTopic,
  ChatMessage as ChatMessageType
} from "@/utils/chatHelpers";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Globe, Lightbulb } from "lucide-react";

interface ChatRoomProps {
  matchId: string;
  partnerName?: string;
  partnerPhoto?: string;
  onBack?: () => void;
}

export function ChatRoom({ matchId, partnerName, partnerPhoto, onBack }: ChatRoomProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTranslation, setShowTranslation] = useState(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    loadMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `match_id=eq.${matchId}`
      }, (payload) => {
        // Add new message to the list
        const newMessage = payload.new as ChatMessageType;
        if (newMessage.sender_id !== user.id) {
          setMessages(prev => [...prev, newMessage]);
          markMessagesAsRead(matchId).catch(console.error);
        }
      })
      .subscribe();
    
    // Mark messages as read when entering the chat
    markMessagesAsRead(matchId).catch(console.error);
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [matchId, user, navigate]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const loadMessages = async () => {
    try {
      setLoading(true);
      const messagesData = await getChatMessages(matchId);
      
      // Sort messages by created_at in ascending order
      const sortedMessages = [...messagesData].sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
      toast({
        title: language === "ko" ? "오류 발생" : "エラーが発生しました",
        description: language === "ko" ? "메시지를 불러오는데 문제가 발생했습니다." : "メッセージの読み込み中にエラーが発生しました。",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    try {
      setIsSending(true);
      
      // Optimistically update UI
      const tempMessage: ChatMessageType = {
        id: `temp-${Date.now()}`,
        sender_id: user!.id,
        content: messageInput,
        translated_content: null,
        is_icebreaker: false,
        read_at: null,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setMessageInput("");
      
      // Send message to server
      await sendChatMessage(matchId, messageInput);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: language === "ko" ? "메시지 전송 실패" : "メッセージの送信に失敗しました",
        description: language === "ko" ? "다시 시도해 주세요." : "もう一度お試しください。",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };
  
  const handleToggleTranslation = () => {
    setShowTranslation(!showTranslation);
  };
  
  const handleGenerateRandomTopic = async () => {
    try {
      setIsGeneratingTopic(true);
      await generateRandomTopic(matchId);
      // No need to add to messages as it will come through the subscription
    } catch (error) {
      console.error("Error generating random topic:", error);
      toast({
        title: language === "ko" ? "주제 생성 실패" : "トピックの生成に失敗しました",
        description: language === "ko" ? "다시 시도해 주세요." : "もう一度お試しください。",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingTopic(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white p-4 border-b flex items-center gap-4 sticky top-0 z-10">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onBack || (() => navigate('/chat'))}
          className="h-8 w-8"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        {partnerPhoto && (
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src={partnerPhoto} 
              alt={partnerName || "Chat partner"} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-medium">{partnerName || "Chat"}</h3>
        </div>
        
        <Button
          variant={showTranslation ? "default" : "outline"}
          size="icon"
          onClick={handleToggleTranslation}
          className="h-8 w-8"
          title={language === "ko" ? "번역 보기/숨기기" : "翻訳表示/非表示"}
        >
          <Globe className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {language === "ko" 
              ? "아직 메시지가 없습니다. 인사를 보내보세요!" 
              : "まだメッセージはありません。挨拶を送ってみましょう！"}
          </div>
        ) : (
          messages.map(message => (
            <ChatMessage 
              key={message.id} 
              message={message} 
              showTranslation={showTranslation}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div className="bg-white border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleGenerateRandomTopic}
            disabled={isGeneratingTopic}
            className="h-10 w-10 flex-shrink-0"
            title={language === "ko" ? "랜덤 주제 생성" : "ランダムトピックを生成"}
          >
            <Lightbulb className="h-5 w-5" />
          </Button>
          
          <Input
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder={language === "ko" ? "메시지 입력..." : "メッセージを入力..."}
            className="flex-1"
            disabled={isSending}
          />
          
          <Button
            type="submit"
            disabled={!messageInput.trim() || isSending}
            className="h-10 bg-primary hover:bg-primary/90 flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
