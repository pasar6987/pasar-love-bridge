
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { CheckCircle, XCircle } from "lucide-react";

interface VerificationRequest {
  id: string;
  user_id: string;
  photo_url: string;
  type: "identity" | "profile";
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  created_at: string;
}

interface UserData {
  id: string;
  nickname: string;
}

export default function Admin() {
  const { t, language } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [identityRequests, setIdentityRequests] = useState<VerificationRequest[]>([]);
  const [profilePhotoRequests, setProfilePhotoRequests] = useState<VerificationRequest[]>([]);
  const [userData, setUserData] = useState<Record<string, UserData>>({});
  const [rejectionReason, setRejectionReason] = useState<Record<string, string>>({});
  const [processingRequest, setProcessingRequest] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();
  
  // Check if user is admin and load data
  useEffect(() => {
    const checkAdminAndLoadData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/login');
          return;
        }
        
        // Check if user is admin
        const { data: isAdminData, error: adminError } = await supabase.rpc('is_admin', {
          user_id: user.id
        });
        
        if (adminError) {
          console.error('Error checking admin status:', adminError);
          navigate('/home');
          return;
        }
        
        if (!isAdminData) {
          // User is not an admin
          navigate('/home');
          return;
        }
        
        setIsAdmin(true);
        
        // Load verification requests
        // For now, use mock data
        // In production, this would fetch from the verification_requests table
        setTimeout(() => {
          const mockIdentityRequests: VerificationRequest[] = [
            {
              id: "1",
              user_id: "user1",
              photo_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
              type: "identity",
              status: "pending",
              created_at: new Date().toISOString()
            },
            {
              id: "2",
              user_id: "user2",
              photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
              type: "identity",
              status: "pending",
              created_at: new Date().toISOString()
            }
          ];
          
          const mockProfilePhotoRequests: VerificationRequest[] = [
            {
              id: "3",
              user_id: "user1",
              photo_url: "https://images.unsplash.com/photo-1599566150163-29194dcaad36",
              type: "profile",
              status: "pending",
              created_at: new Date().toISOString()
            },
            {
              id: "4",
              user_id: "user3",
              photo_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04",
              type: "profile",
              status: "pending",
              created_at: new Date().toISOString()
            }
          ];
          
          // Mock user data
          const mockUserData: Record<string, UserData> = {
            user1: { id: "user1", nickname: "민수" },
            user2: { id: "user2", nickname: "하나코" },
            user3: { id: "user3", nickname: "유카" }
          };
          
          setIdentityRequests(mockIdentityRequests);
          setProfilePhotoRequests(mockProfilePhotoRequests);
          setUserData(mockUserData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error:', error);
        navigate('/home');
      }
    };
    
    checkAdminAndLoadData();
  }, [navigate]);
  
  const handleApprove = async (request: VerificationRequest) => {
    setProcessingRequest(prev => ({ ...prev, [request.id]: true }));
    
    try {
      // In production, this would update the verification_requests table
      console.log(`Approving request ${request.id}`);
      
      // Simulate API call
      setTimeout(() => {
        if (request.type === 'identity') {
          setIdentityRequests(prev => 
            prev.filter(r => r.id !== request.id)
          );
        } else {
          setProfilePhotoRequests(prev => 
            prev.filter(r => r.id !== request.id)
          );
        }
        
        setProcessingRequest(prev => ({ ...prev, [request.id]: false }));
      }, 1000);
    } catch (error) {
      console.error('Error approving request:', error);
      setProcessingRequest(prev => ({ ...prev, [request.id]: false }));
    }
  };
  
  const handleReject = async (request: VerificationRequest) => {
    if (!rejectionReason[request.id]) {
      alert(language === 'ko' ? '거부 사유를 입력해주세요.' : '拒否理由を入力してください。');
      return;
    }
    
    setProcessingRequest(prev => ({ ...prev, [request.id]: true }));
    
    try {
      // In production, this would update the verification_requests table
      console.log(`Rejecting request ${request.id} with reason: ${rejectionReason[request.id]}`);
      
      // Simulate API call
      setTimeout(() => {
        if (request.type === 'identity') {
          setIdentityRequests(prev => 
            prev.filter(r => r.id !== request.id)
          );
        } else {
          setProfilePhotoRequests(prev => 
            prev.filter(r => r.id !== request.id)
          );
        }
        
        setProcessingRequest(prev => ({ ...prev, [request.id]: false }));
        setRejectionReason(prev => {
          const newReasons = { ...prev };
          delete newReasons[request.id];
          return newReasons;
        });
      }, 1000);
    } catch (error) {
      console.error('Error rejecting request:', error);
      setProcessingRequest(prev => ({ ...prev, [request.id]: false }));
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ko' ? 'ko-KR' : 'ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  if (!isAdmin || loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">
          {language === "ko" ? "관리자 페이지" : "管理者ページ"}
        </h1>
        
        <Tabs defaultValue="identity" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="identity">
              {language === "ko" ? "본인인증 요청" : "本人確認リクエスト"}
              {identityRequests.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {identityRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile">
              {language === "ko" ? "프로필 사진 요청" : "プロフィール写真リクエスト"}
              {profilePhotoRequests.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {profilePhotoRequests.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="identity">
            <div className="space-y-4">
              {identityRequests.length > 0 ? identityRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between">
                      <span>{userData[request.user_id]?.nickname || request.user_id}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(request.created_at)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="aspect-[3/2] rounded overflow-hidden mb-4">
                      <img
                        src={request.photo_url}
                        alt="ID Document"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === "ko" ? "거부 사유 (거부 시에만 필요)" : "拒否理由（拒否する場合のみ必要）"}
                      </label>
                      <Textarea
                        value={rejectionReason[request.id] || ''}
                        onChange={(e) => setRejectionReason(prev => ({ 
                          ...prev, 
                          [request.id]: e.target.value 
                        }))}
                        placeholder={language === "ko" ? "거부 사유를 입력하세요" : "拒否理由を入力してください"}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(request)}
                      disabled={processingRequest[request.id]}
                      className="border-red-300 hover:bg-red-50 text-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {language === "ko" ? "거부" : "拒否"}
                    </Button>
                    
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={processingRequest[request.id]}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {language === "ko" ? "승인" : "承認"}
                    </Button>
                  </CardFooter>
                </Card>
              )) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">
                    {language === "ko"
                      ? "대기 중인 본인인증 요청이 없습니다"
                      : "保留中の本人確認リクエストはありません"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <div className="space-y-4">
              {profilePhotoRequests.length > 0 ? profilePhotoRequests.map((request) => (
                <Card key={request.id} className="overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg flex justify-between">
                      <span>{userData[request.user_id]?.nickname || request.user_id}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(request.created_at)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="aspect-[3/2] rounded overflow-hidden mb-4">
                      <img
                        src={request.photo_url}
                        alt="Profile Photo"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === "ko" ? "거부 사유 (거부 시에만 필요)" : "拒否理由（拒否する場合のみ必要）"}
                      </label>
                      <Textarea
                        value={rejectionReason[request.id] || ''}
                        onChange={(e) => setRejectionReason(prev => ({ 
                          ...prev, 
                          [request.id]: e.target.value 
                        }))}
                        placeholder={language === "ko" ? "거부 사유를 입력하세요" : "拒否理由を入力してください"}
                      />
                    </div>
                  </CardContent>
                  
                  <CardFooter className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleReject(request)}
                      disabled={processingRequest[request.id]}
                      className="border-red-300 hover:bg-red-50 text-red-600"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {language === "ko" ? "거부" : "拒否"}
                    </Button>
                    
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={processingRequest[request.id]}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {language === "ko" ? "승인" : "承認"}
                    </Button>
                  </CardFooter>
                </Card>
              )) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">
                    {language === "ko"
                      ? "대기 중인 프로필 사진 요청이 없습니다"
                      : "保留中のプロフィール写真リクエストはありません"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
