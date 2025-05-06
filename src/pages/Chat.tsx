
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatList } from "@/components/chat/ChatList";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { useLanguage } from "@/i18n/useLanguage";
import { useAuth } from "@/context/AuthContext";
import { getUserChats, ChatSession } from "@/utils/chatHelpers";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // If we have a chat ID, try to get details
    if (id) {
      loadChatDetails(id);
    } else {
      setLoading(false);
    }
  }, [id, user, navigate]);

  const loadChatDetails = async (matchId: string) => {
    try {
      setLoading(true);
      const chats = await getUserChats();
      const targetChat = chats.find(chat => chat.match_id === matchId);
      
      if (targetChat) {
        setActiveChat(targetChat);
      } else {
        // If chat doesn't exist, redirect to main chat list
        navigate('/chat');
      }
    } catch (error) {
      console.error("Error loading chat details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center my-8">
          {language === "ko" ? "채팅" : "チャット"}
        </h1>
        
        {id && activeChat ? (
          <div className="bg-white rounded-lg shadow overflow-hidden h-[70vh]">
            <ChatRoom 
              matchId={id}
              partnerName={activeChat.partner_nickname}
              partnerPhoto={activeChat.partner_photo}
              onBack={() => navigate('/chat')}
            />
          </div>
        ) : (
          <ChatList />
        )}
      </div>
    </MainLayout>
  );
}
