
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
import { CheckCircle, XCircle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VerificationRequest {
  id: string;
  user_id: string;
  photo_url?: string;
  id_front_url?: string;
  type: "identity" | "profile";
  status: "pending" | "approved" | "rejected" | "submitted";
  rejection_reason?: string;
  created_at: string;
}

interface UserData {
  id: string;
  nickname: string;
}

export default function Admin() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
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
        
        // Load identity verification requests
        const { data: identityData, error: identityError } = await supabase
          .from('identity_verifications')
          .select('id, user_id, id_front_url, status, submitted_at, rejection_reason')
          .eq('status', 'submitted')
          .order('submitted_at', { ascending: false });
          
        if (identityError) {
          console.error('Error loading identity verifications:', identityError);
        } else {
          const formattedIdentityRequests: VerificationRequest[] = identityData?.map(item => ({
            id: item.id,
            user_id: item.user_id,
            id_front_url: item.id_front_url,
            type: "identity",
            status: item.status,
            rejection_reason: item.rejection_reason,
            created_at: item.submitted_at
          })) || [];
          
          setIdentityRequests(formattedIdentityRequests);
        }
        
        // Load profile photo verification requests
        const { data: profileData, error: profileError } = await supabase
          .from('verification_requests')
          .select('id, user_id, photo_url, status, created_at, rejection_reason')
          .eq('type', 'profile')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
          
        if (profileError) {
          console.error('Error loading profile photo verifications:', profileError);
        } else {
          const formattedProfileRequests: VerificationRequest[] = profileData?.map(item => ({
            id: item.id,
            user_id: item.user_id,
            photo_url: item.photo_url,
            type: "profile",
            status: item.status,
            rejection_reason: item.rejection_reason,
            created_at: item.created_at
          })) || [];
          
          setProfilePhotoRequests(formattedProfileRequests);
        }
        
        // Load user data for each request
        const userIds = new Set([
          ...(identityData?.map(r => r.user_id) || []),
          ...(profileData?.map(r => r.user_id) || [])
        ]);
        
        if (userIds.size > 0) {
          const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, nickname')
            .in('id', Array.from(userIds));
            
          if (usersError) {
            console.error('Error loading user data:', usersError);
          } else if (users) {
            const userDataMap: Record<string, UserData> = {};
            users.forEach(user => {
              userDataMap[user.id] = {
                id: user.id,
                nickname: user.nickname || user.id.substring(0, 8)
              };
            });
            
            setUserData(userDataMap);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        navigate('/home');
      }
    };
    
    checkAdminAndLoadData();
  }, [navigate, toast]);
  
  const handleApprove = async (request: VerificationRequest) => {
    setProcessingRequest(prev => ({ ...prev, [request.id]: true }));
    
    try {
      if (request.type === 'identity') {
        // 1. Update the identity_verifications table
        const { error: updateVerificationError } = await supabase
          .from('identity_verifications')
          .update({
            status: 'approved',
            reviewed_at: new Date().toISOString()
          })
          .eq('id', request.id);
          
        if (updateVerificationError) throw updateVerificationError;
        
        // 2. Update the users table to mark the user as verified
        const { error: updateUserError } = await supabase
          .from('users')
          .update({ is_verified: true })
          .eq('id', request.user_id);
          
        if (updateUserError) throw updateUserError;
        
        // 3. Create a notification for the user
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: request.user_id,
            type: 'verification',
            title: language === 'ko' ? '본인 인증 완료' : '本人確認完了',
            body: language === 'ko' 
              ? '본인 인증이 완료되었습니다. 이제 모든 기능을 사용할 수 있습니다.' 
              : '本人確認が完了しました。これですべての機能を使用できます。'
          });
          
        if (notificationError) throw notificationError;
        
        // Remove the request from the list
        setIdentityRequests(prev => prev.filter(r => r.id !== request.id));
        
        toast({
          title: language === 'ko' ? '인증 승인 완료' : '認証承認完了',
          description: language === 'ko' ? '사용자의 ID 인증이 승인되었습니다.' : 'ユーザーのID認証が承認されました。'
        });
      } else {
        // Handle profile photo verification
        const { error: updateError } = await supabase
          .from('verification_requests')
          .update({
            status: 'approved',
            updated_at: new Date().toISOString()
          })
          .eq('id', request.id);
          
        if (updateError) throw updateError;
        
        // Remove the request from the list
        setProfilePhotoRequests(prev => prev.filter(r => r.id !== request.id));
        
        toast({
          title: language === 'ko' ? '사진 승인 완료' : '写真承認完了',
          description: language === 'ko' ? '사용자의 프로필 사진이 승인되었습니다.' : 'ユーザーのプロフィール写真が承認されました。'
        });
      }
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: language === 'ko' ? '승인 처리 실패' : '承認処理失敗',
        description: language === 'ko' ? '요청을 처리하는 중 오류가 발생했습니다.' : 'リクエストの処理中にエラーが発生しました。',
        variant: 'destructive'
      });
    } finally {
      setProcessingRequest(prev => ({ ...prev, [request.id]: false }));
    }
  };
  
  const handleReject = async (request: VerificationRequest) => {
    if (!rejectionReason[request.id]) {
      toast({
        title: language === 'ko' ? '거부 사유 필요' : '拒否理由が必要',
        description: language === 'ko' ? '거부 사유를 입력해주세요.' : '拒否理由を入力してください。',
        variant: 'destructive'
      });
      return;
    }
    
    setProcessingRequest(prev => ({ ...prev, [request.id]: true }));
    
    try {
      if (request.type === 'identity') {
        // Update the identity_verifications table
        const { error: updateError } = await supabase
          .from('identity_verifications')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason[request.id],
            reviewed_at: new Date().toISOString()
          })
          .eq('id', request.id);
          
        if (updateError) throw updateError;
        
        // Create a notification for the user
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: request.user_id,
            type: 'verification',
            title: language === 'ko' ? '본인 인증 거부' : '本人確認拒否',
            body: rejectionReason[request.id]
          });
          
        if (notificationError) throw notificationError;
        
        // Remove the request from the list
        setIdentityRequests(prev => prev.filter(r => r.id !== request.id));
      } else {
        // Handle profile photo verification rejection
        const { error: updateError } = await supabase
          .from('verification_requests')
          .update({
            status: 'rejected',
            rejection_reason: rejectionReason[request.id],
            updated_at: new Date().toISOString()
          })
          .eq('id', request.id);
          
        if (updateError) throw updateError;
        
        // Remove the request from the list
        setProfilePhotoRequests(prev => prev.filter(r => r.id !== request.id));
      }
      
      // Clear the rejection reason
      setRejectionReason(prev => {
        const newReasons = { ...prev };
        delete newReasons[request.id];
        return newReasons;
      });
      
      toast({
        title: language === 'ko' ? '요청 거부 완료' : 'リクエスト拒否完了',
        description: language === 'ko' ? '요청이 거부되었습니다.' : 'リクエストが拒否されました。'
      });
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: language === 'ko' ? '거부 처리 실패' : '拒否処理失敗',
        description: language === 'ko' ? '요청을 처리하는 중 오류가 발생했습니다.' : 'リクエストの処理中にエラーが発生しました。',
        variant: 'destructive'
      });
    } finally {
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
              {t("admin.identity_verification")}
              {identityRequests.length > 0 && (
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {identityRequests.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile">
              {t("admin.profile_photo")}
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
                      <div className="flex items-center">
                        <Shield className="w-5 h-5 mr-2 text-blue-500" />
                        <span>{userData[request.user_id]?.nickname || request.user_id.substring(0, 8)}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(request.created_at)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="aspect-[3/2] rounded overflow-hidden mb-4">
                      <img
                        src={request.id_front_url}
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
                      {t("admin.reject")}
                    </Button>
                    
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={processingRequest[request.id]}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t("admin.approve")}
                    </Button>
                  </CardFooter>
                </Card>
              )) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">
                    {t("admin.no_requests")}
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
                      <span>{userData[request.user_id]?.nickname || request.user_id.substring(0, 8)}</span>
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
                      {t("admin.reject")}
                    </Button>
                    
                    <Button
                      onClick={() => handleApprove(request)}
                      disabled={processingRequest[request.id]}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t("admin.approve")}
                    </Button>
                  </CardFooter>
                </Card>
              )) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-muted-foreground">
                    {t("admin.no_requests")}
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
