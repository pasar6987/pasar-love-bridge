
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/context/LanguageContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchCard } from "@/components/matches/MatchCard";

export default function MatchRequests() {
  const { t, language } = useLanguage();
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockSentRequests = [
        {
          id: "1",
          name: language === "ko" ? "하나코" : "花子",
          age: 28,
          photo: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
          matchDate: language === "ko" ? "2023년 5월 3일" : "2023年5月3日",
          status: "pending"
        },
        {
          id: "2",
          name: language === "ko" ? "유카" : "ゆか",
          age: 25,
          photo: "https://images.unsplash.com/photo-1606406054219-619c4c2e2100?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGFzaWFuJTIwd29tYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=800&q=60",
          matchDate: language === "ko" ? "2023년 5월 1일" : "2023年5月1日",
          status: "accepted"
        }
      ];
      
      const mockReceivedRequests = [
        {
          id: "3",
          name: language === "ko" ? "마이" : "まい",
          age: 27,
          photo: "https://images.unsplash.com/photo-1609132718484-cc90df3417f8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8YXNpYW4lMjB3b21hbnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
          matchDate: language === "ko" ? "2023년 5월 2일" : "2023年5月2日",
          status: "pending"
        }
      ];
      
      setSentRequests(mockSentRequests);
      setReceivedRequests(mockReceivedRequests);
      setLoading(false);
    }, 1000);
  }, [language]);

  const handleAccept = (id: string) => {
    setReceivedRequests(
      receivedRequests.map((req) =>
        req.id === id ? { ...req, status: "accepted" } : req
      )
    );
  };

  const handleReject = (id: string) => {
    setReceivedRequests(
      receivedRequests.map((req) =>
        req.id === id ? { ...req, status: "rejected" } : req
      )
    );
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold text-center mb-8">
          {language === "ko" ? "매칭 요청" : "マッチングリクエスト"}
        </h1>

        <Tabs defaultValue="received" className="w-full max-w-3xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="received">
              {language === "ko" ? "받은 요청" : "受信したリクエスト"}
              {receivedRequests.some(r => r.status === "pending") && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {receivedRequests.filter(r => r.status === "pending").length}
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
              receivedRequests.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  type="received"
                  onAccept={handleAccept}
                  onReject={handleReject}
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
              sentRequests.map((match) => (
                <MatchCard key={match.id} match={match} type="sent" />
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
