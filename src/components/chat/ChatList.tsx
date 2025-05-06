
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/useLanguage";
import { Link } from "react-router-dom";
import { formatTimeAgo, getUserChats, ChatSession } from "@/utils/chatHelpers";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export function ChatList() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChats();
    
    // Subscribe to new messages using Supabase Realtime
    const channel = supabase
      .channel('public:chat_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages'
      }, () => {
        // Reload chats when a new message is received
        loadChats();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const loadChats = async () => {
    try {
      setLoading(true);
      const data = await getUserChats();
      setChats(data);
    } catch (error) {
      toast({
        title: language === "ko" ? "오류 발생" : "エラーが発生しました",
        description: language === "ko" ? "채팅 목록을 불러오는데 문제가 발생했습니다." : "チャットリストの読み込み中にエラーが発生しました。",
        variant: "destructive"
      });
      console.error("Error loading chats:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (chats.length === 0) {
    return (
      <div className="pasar-card max-w-lg mx-auto p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pastel-pink/20 flex items-center justify-center">
          <img 
            src="/lovable-uploads/6bdd8a27-cd91-4f69-bda2-2afe0a4a0cdd.png" 
            alt="Pasar" 
            className="h-12 w-12"
          />
        </div>
        <h3 className="text-xl font-medium mb-3">
          {language === "ko" ? "아직 매칭된 채팅이 없습니다" : "まだマッチングしたチャットがありません"}
        </h3>
        <p className="text-muted-foreground mb-6">
          {language === "ko"
            ? "매칭이 성사되면 이곳에서 채팅을 시작할 수 있어요!"
            : "マッチングが成立したら、ここでチャットを開始できます！"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {chats.map((chat) => (
        <Link to={`/chat/${chat.match_id}`} key={chat.match_id}>
          <div className="pasar-card flex items-center p-4 hover:bg-slate-50">
            <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
              <img 
                src={chat.partner_photo || "/placeholder.svg"} 
                alt={chat.partner_nickname} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center">
                <h3 className="font-medium truncate">{chat.partner_nickname}</h3>
                <span className="text-xs text-muted-foreground">
                  {chat.last_message_time ? formatTimeAgo(chat.last_message_time, language) : ""}
                </span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {chat.last_message || (language === "ko" ? "새 매치! 대화를 시작해보세요." : "新しいマッチ！会話を始めましょう。")}
              </p>
            </div>
            {chat.unread_count > 0 && (
              <Badge className="ml-2 bg-primary">{chat.unread_count}</Badge>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
