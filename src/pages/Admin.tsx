import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { DebugInfoCard } from "@/components/admin/DebugInfoCard";
import { AdminTabs } from "@/components/admin/AdminTabs";
import { VerificationRequest } from "@/components/admin/IdentityVerificationList";

export default function Admin() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [identityRequests, setIdentityRequests] = useState<VerificationRequest[]>([]);
  const [photoRequests, setPhotoRequests] = useState<VerificationRequest[]>([]);
  const [loading, setLoading] = useState(true);
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
        status: item.status as VerificationRequest["status"],
        rejection_reason: item.rejection_reason || "",
        created_at: item.created_at,
        user_display_name: item.users?.nickname || item.user_id
      }));
      
      setIdentityRequests(formattedIdentityRequests);
      
      // Modified approach for profile verification requests to handle missing foreign key relationship
      const { data: photoData, error: photoError } = await supabase.functions.invoke('get-verification-requests', {
        body: {
          type: 'profile_photo',
          status: 'pending'
        }
      });
        
      if (photoError) {
        console.log("[Admin Debug] 프로필 사진 인증 요청 조회 오류", photoError);
        throw photoError;
      }
      
      console.log("[Admin Debug] 프로필 사진 인증 요청 조회 결과", { data: photoData });
      
      if (photoData && photoData.requests) {
        setPhotoRequests(photoData.requests);
      } else {
        setPhotoRequests([]);
      }
      
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
        <DebugInfoCard 
          user={user}
          isAdmin={isAdmin}
          adminCheckComplete={adminCheckComplete}
          loading={loading}
        />
        
        <AdminTabs
          identityRequests={identityRequests}
          photoRequests={photoRequests}
          loading={loading}
          onRefresh={fetchVerificationRequests}
        />
      </div>
    </MainLayout>
  );
}
