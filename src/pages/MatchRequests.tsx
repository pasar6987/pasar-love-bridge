
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchRequestItem } from "@/components/matches/MatchRequestItem";
import { fetchSentRequests, fetchReceivedRequests } from "@/utils/matchHelpers";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function MatchRequests() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadMatchRequests = async () => {
      try {
        setLoading(true);
        
        // Fetch both sent and received requests
        const [sent, received] = await Promise.all([
          fetchSentRequests(),
          fetchReceivedRequests()
        ]);
        
        setSentRequests(sent || []);
        setReceivedRequests(received || []);
      } catch (error) {
        console.error("Error loading match requests:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMatchRequests();
  }, [user, navigate]);

  const handleRequestAction = (id: string, action: 'accept' | 'reject') => {
    // Remove the request from the list
    setReceivedRequests(prev => prev.filter(req => req.id !== id));
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          {language === "ko" ? "매칭 요청" : "マッチングリクエスト"}
        </h1>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="received">
              {language === "ko" ? "받은 요청" : "受信したリクエスト"}
              {receivedRequests.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {receivedRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">
              {language === "ko" ? "보낸 요청" : "送信したリクエスト"}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : receivedRequests.length > 0 ? (
              receivedRequests.map((request) => (
                <MatchRequestItem
                  key={request.id}
                  id={request.id}
                  profile={request.profile}
                  requestedAt={request.requestedAt}
                  type="received"
                  onAction={handleRequestAction}
                />
              ))
            ) : (
              <div className="pasar-card text-center p-8">
                <p className="text-muted-foreground">
                  {language === "ko"
                    ? "받은 매칭 요청이 없습니다"
                    : "受信したマッチングリクエストがありません"}
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="sent" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : sentRequests.length > 0 ? (
              sentRequests.map((request) => (
                <MatchRequestItem
                  key={request.id}
                  id={request.id}
                  profile={request.profile}
                  requestedAt={request.requestedAt}
                  status={request.status}
                  type="sent"
                />
              ))
            ) : (
              <div className="pasar-card text-center p-8">
                <p className="text-muted-foreground">
                  {language === "ko"
                    ? "보낸 매칭 요청이 없습니다"
                    : "送信したマッチングリクエストがありません"}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
