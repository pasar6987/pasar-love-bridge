
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { ChatList } from "@/components/chat/ChatList";
import { ChatRoom } from "@/components/chat/ChatRoom";
import { useLanguage } from "@/i18n/useLanguage";
import { useAuth } from "@/context/AuthContext";
import { getUserChats, ChatSession } from "@/utils/chatHelpers";
import { checkVerificationStatus } from "@/utils/verificationHelpers";
import { useToast } from "@/hooks/use-toast";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeChat, setActiveChat] = useState<ChatSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(true); // Default to true to avoid flash of verification message
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Check verification status
    const checkVerification = async () => {
      try {
        const { is_verified, verification_status } = await checkVerificationStatus();
        setIsVerified(is_verified);
        setVerificationStatus(verification_status);
        
        // If verified or has ongoing verification, continue loading chat
        if (is_verified || verification_status === 'approved') {
          if (id) {
            loadChatDetails(id);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error checking verification status:", error);
        toast({
          title: language === "ko" ? "오류 발생" : "エラーが発生しました",
          description: language === "ko" ? "인증 상태를 확인하는 중 오류가 발생했습니다." : "認証状態の確認中にエラーが発生しました。",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    checkVerification();
  }, [id, user, navigate, language, toast]);

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
  
  // Show verification required message if not verified
  if (!isVerified) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-center my-8">
            {language === "ko" ? "채팅" : "チャット"}
          </h1>
          
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pastel-pink/20 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-3">
              {language === "ko" ? "신분증 인증이 필요합니다" : "身分証明書の認証が必要です"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === "ko"
                ? verificationStatus === 'submitted' || verificationStatus === 'in_review' 
                  ? "신분증 인증이 검토 중입니다. 승인 후 채팅이 가능합니다."
                  : verificationStatus === 'rejected'
                  ? "신분증 인증이 거부되었습니다. 다시 제출해 주세요."
                  : "안전한 매칭을 위해 신분증 인증이 필요합니다. 인증 후 채팅이 가능합니다."
                : verificationStatus === 'submitted' || verificationStatus === 'in_review'
                  ? "身分証明書の確認が審査中です。承認後にチャットが可能になります。"
                  : verificationStatus === 'rejected'
                  ? "身分証明書の認証が拒否されました。再度提出してください。"
                  : "安全なマッチングのために身分証明書の認証が必要です。認証後にチャットが可能になります。"}
            </p>
            <Button 
              onClick={() => navigate('/verify')} 
              className="pasar-btn"
            >
              {language === "ko" ? "신분증 인증하기" : "身分証明書を認証する"}
            </Button>
          </div>
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
