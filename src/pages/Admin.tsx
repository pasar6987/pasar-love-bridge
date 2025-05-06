
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

type VerificationStatus = "pending" | "approved" | "rejected" | "submitted";

interface VerificationRequest {
  id: string;
  user_id: string;
  id_front_url?: string;
  photo_url?: string;
  type: "identity" | "profile";
  status: VerificationStatus;
  rejection_reason: string;
  created_at: string;
  user_display_name?: string;
}

export default function Admin() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState("identity");
  const [identityRequests, setIdentityRequests] = useState<VerificationRequest[]>([]);
  const [photoRequests, setPhotoRequests] = useState<VerificationRequest[]>([]);
  const [rejectionReason, setRejectionReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      console.log("[Admin Debug] checkAdminStatus 시작", { userId: user?.id });
      
      // Wait until auth loading is complete
      if (authLoading) {
        console.log("[Admin Debug] 인증 로딩 중, 대기");
        return;
      }
      
      if (!user) {
        console.log("[Admin Debug] 사용자가 로그인하지 않음, 로그인 페이지로 리디렉션");
        navigate('/login');
        return;
      }
      
      try {
        console.log("[Admin Debug] is_admin RPC 호출 시작", { userId: user.id });
        
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: user.id
        });
          
        if (error) {
          console.log("[Admin Debug] is_admin RPC 호출 오류", error);
          throw error;
        }
        
        console.log("[Admin Debug] is_admin RPC 호출 결과", { isAdmin: data });
        
        if (!data) {
          console.log("[Admin Debug] 사용자가 관리자가 아님, 홈 페이지로 리디렉션");
          setIsAdmin(false);
          setAdminCheckComplete(true);
          navigate('/home');
          return;
        }
        
        console.log("[Admin Debug] 사용자는 관리자임, 관리자 페이지 접근 허용");
        setIsAdmin(true);
        setAdminCheckComplete(true);
        fetchVerificationRequests();
      } catch (error) {
        console.log("[Admin Debug] 관리자 상태 확인 오류", error);
        setAdminCheckComplete(true);
        navigate('/home');
      }
    };
    
    checkAdminStatus();
  }, [user, authLoading, navigate]);

  const fetchVerificationRequests = async () => {
    try {
      console.log("[Admin Debug] 인증 요청 조회 시작");
      
      // Fetch identity verification requests - modified to avoid email column issue
      const { data: identityData, error: identityError } = await supabase
        .from('identity_verifications')
        .select('*, users(id, nickname)')
        .eq('status', 'submitted')
        .order('created_at', { ascending: false });
        
      if (identityError) {
        console.log("[Admin Debug] 신분증 인증 요청 조회 오류", identityError);
        throw identityError;
      }
      
      console.log("[Admin Debug] 신분증 인증 요청 조회 결과", { count: identityData?.length });
      
      const formattedIdentityRequests: VerificationRequest[] = (identityData || []).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        id_front_url: item.id_front_url,
        type: "identity",
        status: item.status as VerificationStatus,
        rejection_reason: item.rejection_reason || "",
        created_at: item.created_at,
        user_display_name: item.users?.nickname || item.user_id
      }));
      
      setIdentityRequests(formattedIdentityRequests);
      
      // Modified approach for profile verification requests to handle missing foreign key relationship
      const { data: photoData, error: photoError } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('status', 'submitted')
        .eq('type', 'profile')
        .order('created_at', { ascending: false });
        
      if (photoError) {
        console.log("[Admin Debug] 프로필 사진 인증 요청 조회 오류", photoError);
        throw photoError;
      }
      
      console.log("[Admin Debug] 프로필 사진 인증 요청 조회 결과", { count: photoData?.length });
      
      // Get associated user data separately since there's no foreign key relationship
      const photoRequests: VerificationRequest[] = [];
      
      if (photoData && photoData.length > 0) {
        // Get unique user IDs from photo verification requests
        const userIds = [...new Set(photoData.map((item: any) => item.user_id))];
        
        // Fetch user data for these IDs
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, nickname')
          .in('id', userIds);
          
        if (userError) {
          console.log("[Admin Debug] 사용자 정보 조회 오류", userError);
          // Continue with what we have even if user lookup fails
        }
        
        // Create a lookup map for user data
        const userMap = new Map();
        if (userData) {
          userData.forEach((user: any) => {
            userMap.set(user.id, user.nickname);
          });
        }
        
        // Format photo verification requests with user data from the lookup map
        photoData.forEach((item: any) => {
          photoRequests.push({
            id: item.id,
            user_id: item.user_id,
            photo_url: item.photo_url,
            type: "profile",
            status: item.status as VerificationStatus,
            rejection_reason: item.rejection_reason || "",
            created_at: item.created_at,
            user_display_name: userMap.get(item.user_id) || item.user_id
          });
        });
      }
      
      setPhotoRequests(photoRequests);
      
    } catch (error) {
      console.error("인증 요청 조회 오류:", error);
      toast({
        title: t("error.generic"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleApprove = async (request: VerificationRequest) => {
    setProcessingId(request.id);
    
    try {
      if (request.type === "identity") {
        // Update identity verification status
        const { error: updateError } = await supabase
          .from('identity_verifications')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', request.id);
          
        if (updateError) throw updateError;
        
        // Update user is_verified status
        const { error: userUpdateError } = await supabase
          .from('users')
          .update({ is_verified: true, updated_at: new Date().toISOString() })
          .eq('id', request.user_id);
          
        if (userUpdateError) throw userUpdateError;
        
        // Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: request.user_id,
            type: 'verify_passed',
            title: language === 'ko' ? '신분증 인증 완료' : '本人確認完了',
            body: language === 'ko' 
              ? '신분증 인증이 완료되었습니다. 이제 채팅 기능을 사용할 수 있습니다.' 
              : '本人確認が完了しました。チャット機能が使えるようになりました。',
            is_read: false
          });
          
        if (notificationError) throw notificationError;
        
      } else if (request.type === "profile") {
        // Update profile photo verification status
        const { error: updateError } = await supabase
          .from('verification_requests')
          .update({ status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', request.id);
          
        if (updateError) throw updateError;
        
        // Get profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profile_photos')
          .select('*')
          .eq('user_id', request.user_id);
          
        if (profileError) throw profileError;
        
        // Add photo to user's profile photos
        if (request.photo_url) {
          const photoOrder = profileData ? profileData.length : 0;
          
          // Insert the photo to profile_photos
          const { error: photoUpdateError } = await supabase
            .from('profile_photos')
            .insert({ 
              user_id: request.user_id,
              url: request.photo_url,
              sort_order: photoOrder
            });
            
          if (photoUpdateError) throw photoUpdateError;
        }
        
        // Create notification
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: request.user_id,
            type: 'photo_approved',
            title: language === 'ko' ? '프로필 사진 승인' : 'プロフィール写真承認',
            body: language === 'ko' 
              ? '프로필 사진이 승인되었습니다.' 
              : 'プロフィール写真が承認されました。',
            is_read: false
          });
          
        if (notificationError) throw notificationError;
      }
      
      // Refresh requests
      fetchVerificationRequests();
      
      toast({
        title: language === 'ko' ? '승인 완료' : '承認完了',
        description: language === 'ko' ? '요청이 승인되었습니다.' : 'リクエストが承認されました。'
      });
      
    } catch (error) {
      console.error("요청 승인 오류:", error);
      toast({
        title: t("error.generic"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (request: VerificationRequest) => {
    if (!rejectionReason) {
      toast({
        title: language === 'ko' ? '거부 사유 필요' : '拒否理由が必要です',
        description: language === 'ko' ? '거부 사유를 입력해주세요.' : '拒否理由を入力してください。',
        variant: "destructive"
      });
      return;
    }
    
    setProcessingId(request.id);
    
    try {
      if (request.type === "identity") {
        // Update identity verification status
        const { error: updateError } = await supabase
          .from('identity_verifications')
          .update({ 
            status: 'rejected', 
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString() 
          })
          .eq('id', request.id);
          
        if (updateError) throw updateError;
        
      } else if (request.type === "profile") {
        // Update profile photo verification status
        const { error: updateError } = await supabase
          .from('verification_requests')
          .update({ 
            status: 'rejected', 
            rejection_reason: rejectionReason,
            updated_at: new Date().toISOString() 
          })
          .eq('id', request.id);
          
        if (updateError) throw updateError;
      }
      
      // Create notification
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: request.user_id,
          type: request.type === 'identity' ? 'verify_rejected' : 'photo_rejected',
          title: language === 'ko' 
            ? (request.type === 'identity' ? '신분증 인증 거부' : '프로필 사진 거부') 
            : (request.type === 'identity' ? '本人確認拒否' : 'プロフィール写真拒否'),
          body: language === 'ko' 
            ? `사유: ${rejectionReason}` 
            : `理由: ${rejectionReason}`,
          is_read: false
        });
        
      if (notificationError) throw notificationError;
      
      // Refresh requests
      fetchVerificationRequests();
      setRejectionReason("");
      
      toast({
        title: language === 'ko' ? '거부 완료' : '拒否完了',
        description: language === 'ko' ? '요청이 거부되었습니다.' : 'リクエ스트が拒否されました。'
      });
      
    } catch (error) {
      console.error("요청 거부 오류:", error);
      toast({
        title: t("error.generic"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };
  
  if (authLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-[50vh] p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <div>로그인 정보를 확인하는 중입니다...</div>
        </div>
      </MainLayout>
    );
  }

  if (!adminCheckComplete) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-[50vh] p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <div>관리자 권한을 확인하는 중입니다...</div>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-md w-full max-w-xl">
            <h3 className="font-semibold mb-2">디버깅 정보:</h3>
            <div className="overflow-auto max-h-96 text-xs font-mono">
              <pre>{JSON.stringify({user: user?.id, isAdmin, adminCheckComplete}, null, 2)}</pre>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MainLayout>
        <div className="flex flex-col justify-center items-center h-[50vh] p-6">
          <div className="text-xl font-semibold mb-4">관리자 권한이 없습니다</div>
          <div className="mb-6">이 페이지에 접근하려면 관리자 권한이 필요합니다.</div>
          <Button onClick={() => navigate('/home')}>홈으로 돌아가기</Button>
          
          <div className="mt-6 p-4 bg-gray-100 rounded-md w-full max-w-xl">
            <h3 className="font-semibold mb-2">디버깅 정보:</h3>
            <div className="overflow-auto max-h-96 text-xs font-mono">
              <pre>{JSON.stringify({user: user?.id, isAdmin, adminCheckComplete}, null, 2)}</pre>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {language === 'ko' ? '관리자 페이지' : '管理者ページ'}
        </h1>
        
        {/* 디버깅 정보 표시 */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>디버깅 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>키</TableHead>
                  <TableHead>값</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>사용자 ID</TableCell>
                  <TableCell>{user?.id || '없음'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>관리자 상태</TableCell>
                  <TableCell>{isAdmin ? '관리자임' : '관리자 아님'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>관리자 확인 완료</TableCell>
                  <TableCell>{adminCheckComplete ? '완료' : '진행 중'}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>로딩 상태</TableCell>
                  <TableCell>{loading ? '로딩 중' : '로딩 완료'}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="identity" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="identity">{t("admin.identity_verification")}</TabsTrigger>
            <TabsTrigger value="profile">{t("admin.profile_photo")}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="identity">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.identity_verification")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : identityRequests.length > 0 ? (
                  <div className="space-y-8">
                    {identityRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              {language === 'ko' ? '사용자' : 'ユーザー'}
                            </p>
                            <p>{request.user_display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              {language === 'ko' ? '신분증' : '身分証明書'}
                            </p>
                            {request.id_front_url && (
                              <div className="max-w-sm mx-auto">
                                <img 
                                  src={request.id_front_url} 
                                  alt="ID Document" 
                                  className="w-full rounded-md border"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`rejection-reason-${request.id}`}>
                              {language === 'ko' ? '거부 사유 (거부 시 필수)' : '拒否理由（拒否する場合は必須）'}
                            </Label>
                            <Input
                              id={`rejection-reason-${request.id}`}
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder={language === 'ko' ? '거부 사유를 입력하세요' : '拒否理由を入力してください'}
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(request)}
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                              ) : (
                                t("admin.reject")
                              )}
                            </Button>
                            <Button
                              onClick={() => handleApprove(request)}
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                              ) : (
                                t("admin.approve")
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    {t("admin.no_requests")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>{t("admin.profile_photo")}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : photoRequests.length > 0 ? (
                  <div className="space-y-8">
                    {photoRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                              {language === 'ko' ? '사용자' : 'ユーザー'}
                            </p>
                            <p>{request.user_display_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(request.created_at).toLocaleString()}
                            </p>
                          </div>
                          
                          <div className="col-span-2">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              {language === 'ko' ? '프로필 사진' : 'プロフィール写真'}
                            </p>
                            {request.photo_url && (
                              <div className="max-w-sm mx-auto">
                                <img 
                                  src={request.photo_url} 
                                  alt="Profile" 
                                  className="w-full rounded-md border"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor={`rejection-reason-${request.id}`}>
                              {language === 'ko' ? '거부 사유 (거부 시 필수)' : '拒否理由（拒否する場合は必須）'}
                            </Label>
                            <Input
                              id={`rejection-reason-${request.id}`}
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder={language === 'ko' ? '거부 사유를 입력하세요' : '拒否理由を入力してください'}
                            />
                          </div>
                          
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="destructive"
                              onClick={() => handleReject(request)}
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                              ) : (
                                t("admin.reject")
                              )}
                            </Button>
                            <Button
                              onClick={() => handleApprove(request)}
                              disabled={processingId === request.id}
                            >
                              {processingId === request.id ? (
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                              ) : (
                                t("admin.approve")
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    {t("admin.no_requests")}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
