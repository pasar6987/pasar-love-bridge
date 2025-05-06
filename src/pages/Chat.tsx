
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { ChatBox } from "@/components/chat/ChatBox";
import { useParams, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";

interface ChatPartner {
  id: string;
  name: string;
  photo: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  matchId?: string;
}

export default function Chat() {
  const { id } = useParams<{ id?: string }>();
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chatPartners, setChatPartners] = useState<ChatPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<ChatPartner | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("user123"); // Default mock ID
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationLoading, setVerificationLoading] = useState<boolean>(true);
  
  // Check if user is verified
  useEffect(() => {
    const checkVerification = async () => {
      if (!user) return;
      
      try {
        // Get verification status from users table
        const { data, error } = await supabase
          .from('users')
          .select('is_verified')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setIsVerified(data?.is_verified || false);
      } catch (error) {
        console.error("Error checking verification status:", error);
      } finally {
        setVerificationLoading(false);
      }
    };
    
    checkVerification();
  }, [user]);
  
  // Load user info and chat partners
  useEffect(() => {
    const loadUserAndChats = async () => {
      try {
        // Get current user using the built-in auth RPC
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setCurrentUserId(user.id);
        }
        
        // For now use mock data
        // In production, this would fetch from an RPC function like 'get_user_chat_partners'
        const mockChatPartners: ChatPartner[] = [
          {
            id: "2",
            name: "유카", // Keep names as is regardless of interface language
            photo: "https://images.unsplash.com/photo-1606406054219-619c4c2e2100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
            lastMessage: "안녕하세요! 반가워요 :)", // Message content stays original
            lastMessageTime: "14:30",
            unread: 0,
            matchId: "match123"
          }
        ];
        
        setChatPartners(mockChatPartners);
        
        if (id) {
          const partner = mockChatPartners.find(p => p.id === id);
          if (partner) {
            setSelectedPartner(partner);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error loading chats:", error);
        setLoading(false);
      }
    };
    
    loadUserAndChats();
  }, [id]);

  const formatTimeRelative = (timeString: string) => {
    // For demonstration, just return the time string
    // In production, this could be an RPC function or utility function
    return timeString;
  };
  
  // If verification is still being checked, show loading
  if (verificationLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  // If user is not verified, show verification required message
  if (!isVerified) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center justify-center h-[50vh]">
          <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-center">
            {t("chat.verification_required")}
          </h2>
          <p className="text-muted-foreground text-center mb-6">
            {t("onboarding.verification.desc")}
          </p>
          <Button 
            onClick={() => navigate('/onboarding/4')} 
            className="pasar-btn"
          >
            {t("chat.verify_now")}
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout hideFooter>
      <div className="max-w-7xl mx-auto h-[calc(100vh-10rem)] flex">
        <div className="w-full md:w-1/3 border-r">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg">
              {t("chat.messages")}
            </h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : chatPartners.length > 0 ? (
            <div className="overflow-y-auto h-full pb-20">
              {chatPartners.map((partner) => (
                <Link
                  key={partner.id}
                  to={`/chat/${partner.id}`}
                  className={`flex items-center p-4 border-b hover:bg-gray-50 transition-colors ${
                    selectedPartner?.id === partner.id ? "bg-pastel-lavender/10" : ""
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden">
                      <img
                        src={partner.photo}
                        alt={partner.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {partner.unread > 0 && (
                      <div className="absolute -top-1 -right-1 bg-primary rounded-full w-5 h-5 flex items-center justify-center text-xs text-white">
                        {partner.unread}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-4 flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{partner.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {formatTimeRelative(partner.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {partner.lastMessage}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 p-4">
              <p className="text-center text-muted-foreground mb-4">
                {t("chat.noPartners")}
              </p>
              <Link
                to="/matches"
                className="text-primary hover:underline text-sm"
              >
                {t("chat.checkMatches")}
              </Link>
            </div>
          )}
        </div>
        
        <div className="hidden md:flex md:w-2/3 flex-col">
          {selectedPartner ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b flex items-center">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={selectedPartner.photo}
                    alt={selectedPartner.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{selectedPartner.name}</h3>
                </div>
              </div>
              
              <div className="flex-grow overflow-hidden">
                <ChatBox 
                  chatPartner={selectedPartner} 
                  userId={currentUserId} 
                  matchId={selectedPartner.matchId}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 bg-gray-50">
              <div className="text-center max-w-md">
                <h3 className="text-lg font-medium mb-2">
                  {t("chat.startConversation")}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {t("chat.selectPartner")}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
