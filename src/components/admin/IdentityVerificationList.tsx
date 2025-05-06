
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/useLanguage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { checkFileExists } from "@/utils/storageHelpers";
import { Loader2 } from "lucide-react";

export type VerificationStatus = "pending" | "approved" | "rejected" | "submitted";

export interface VerificationRequest {
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

interface IdentityVerificationListProps {
  identityRequests: VerificationRequest[];
  loading: boolean;
  onRefresh: () => void;
}

export const IdentityVerificationList = ({ identityRequests, loading, onRefresh }: IdentityVerificationListProps) => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [rejectionReason, setRejectionReason] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [imageLoading, setImageLoading] = useState<Record<string, boolean>>({});
  const [retrying, setRetrying] = useState<Record<string, boolean>>({});
  
  // URL 디버깅용 정보 저장
  const [imageUrls, setImageUrls] = useState<Record<string, {url: string, path: string}>>({});
  
  useEffect(() => {
    // 요청이 있을 때 이미지 URL 정보 처리
    const processImageUrls = async () => {
      const newImageUrls: Record<string, {url: string, path: string}> = {};
      const newImageLoading: Record<string, boolean> = {};
      
      for (const request of identityRequests) {
        if (request.id_front_url) {
          try {
            newImageLoading[request.id] = true;
            
            // URL에서 경로 추출
            const url = new URL(request.id_front_url);
            const fullPath = url.pathname;
            const pathParts = fullPath.split('/');
            const bucketIndex = pathParts.findIndex(part => part === 'public') + 1;
            
            if (bucketIndex > 0 && bucketIndex < pathParts.length) {
              const bucket = pathParts[bucketIndex];
              const objectPath = pathParts.slice(bucketIndex + 1).join('/');
              
              newImageUrls[request.id] = {
                url: request.id_front_url,
                path: objectPath
              };
              
              console.log(`이미지 URL 정보 - 요청 ID: ${request.id}`, {
                url: request.id_front_url,
                bucket,
                path: objectPath
              });
              
              // 파일 존재 여부 확인
              const exists = await checkFileExists(bucket, objectPath);
              console.log(`파일 존재 여부 - 요청 ID: ${request.id}`, { exists, bucket, path: objectPath });
              
              if (!exists) {
                setImageErrors(prev => ({ ...prev, [request.id]: true }));
              }
            }
            
            newImageLoading[request.id] = false;
          } catch (error) {
            console.error("URL 파싱 오류:", error);
            newImageLoading[request.id] = false;
          }
        }
      }
      
      setImageUrls(newImageUrls);
      setImageLoading(newImageLoading);
    };
    
    if (identityRequests.length > 0) {
      processImageUrls();
    }
  }, [identityRequests]);
  
  const handleApprove = async (request: VerificationRequest) => {
    setProcessingId(request.id);
    
    try {
      // Update identity verification status
      const { error: updateError } = await supabase
        .from('identity_verifications')
        .update({ 
          status: 'approved', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', request.id);
        
      if (updateError) throw updateError;
      
      // Update user is_verified status
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          is_verified: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', request.user_id);
        
      if (userUpdateError) throw userUpdateError;
      
      // Create notification - Use RPC function to bypass RLS
      const { data: notificationData, error: notificationError } = await supabase.rpc(
        'create_admin_notification',
        {
          p_user_id: request.user_id,
          p_type: 'verify_passed',
          p_title: language === 'ko' ? '신분증 인증 완료' : '本人確認完了',
          p_body: language === 'ko' 
            ? '신분증 인증이 완료되었습니다. 이제 채팅 기능을 사용할 수 있습니다.' 
            : '本人確認が完了しました。チャット機能が使えるようになりました。'
        }
      );
        
      if (notificationError) throw notificationError;
      
      // Refresh requests
      onRefresh();
      
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
      
      // Update user is_verified status to false when rejected
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ 
          is_verified: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', request.user_id);
        
      if (userUpdateError) throw userUpdateError;
      
      // Create notification - Use RPC function to bypass RLS
      const { data: notificationData, error: notificationError } = await supabase.rpc(
        'create_admin_notification',
        {
          p_user_id: request.user_id,
          p_type: 'verify_rejected',
          p_title: language === 'ko' ? '신분증 인증 거부' : '本人確認拒否',
          p_body: language === 'ko' ? `사유: ${rejectionReason}` : `理由: ${rejectionReason}`
        }
      );
        
      if (notificationError) throw notificationError;
      
      // Refresh requests
      onRefresh();
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
  
  const handleImageError = (id: string) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
    console.error("Failed to load image for request ID:", id, imageUrls[id]);
  };

  const handleRetryImage = (id: string, url: string) => {
    setRetrying(prev => ({ ...prev, [id]: true }));
    setImageErrors(prev => ({ ...prev, [id]: false }));
    
    // 캐시 우회를 위한 타임스탬프 추가
    const timestamp = new Date().getTime();
    const newUrl = url.includes('?') 
      ? `${url}&t=${timestamp}` 
      : `${url}?t=${timestamp}`;
      
    console.log("이미지 다시 로드 시도:", newUrl);
    
    // 이미지를 다시 로드하기 위해 타임아웃 사용
    setTimeout(() => {
      setRetrying(prev => ({ ...prev, [id]: false }));
    }, 1500);
  };

  return (
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
                        {imageLoading[request.id] ? (
                          <div className="border rounded-md p-4 text-center bg-gray-100 h-64 flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                            <p className="mt-2 text-sm text-muted-foreground">
                              {language === 'ko' ? '이미지 로딩 중...' : '画像をロード中...'}
                            </p>
                          </div>
                        ) : imageErrors[request.id] ? (
                          <div className="border rounded-md p-4 text-center bg-gray-100 h-64 flex flex-col items-center justify-center">
                            <Avatar className="h-16 w-16 mb-2">
                              <AvatarFallback>{request.user_display_name?.substring(0, 2) || "??"}</AvatarFallback>
                            </Avatar>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ko' ? '이미지를 불러올 수 없습니다' : '画像を読み込めません'}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {request.id_front_url ? new URL(request.id_front_url).pathname.split('/').pop() || 'Unknown file' : 'Unknown file'}
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-3"
                              onClick={() => handleRetryImage(request.id, request.id_front_url || "")}
                              disabled={retrying[request.id]}
                            >
                              {retrying[request.id] ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {language === 'ko' ? '다시 시도 중...' : '再試行中...'}
                                </>
                              ) : (
                                language === 'ko' ? '다시 시도' : '再試行'
                              )}
                            </Button>
                          </div>
                        ) : (
                          <a href={request.id_front_url} target="_blank" rel="noopener noreferrer">
                            <img 
                              src={request.id_front_url} 
                              alt="ID Document" 
                              className="w-full rounded-md border object-contain max-h-64"
                              onError={() => handleImageError(request.id)}
                            />
                          </a>
                        )}
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
  );
};
