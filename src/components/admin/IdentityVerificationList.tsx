
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
import { Loader2, RefreshCw } from "lucide-react";

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
  const [availableBuckets, setAvailableBuckets] = useState<string[]>([]);
  
  // 버킷 목록 조회
  useEffect(() => {
    const checkBuckets = async () => {
      try {
        const { data, error } = await supabase.storage.listBuckets();
        if (error) {
          console.error("버킷 목록 조회 오류:", error);
        } else {
          const bucketNames = data.map(bucket => bucket.name);
          console.log("사용 가능한 스토리지 버킷:", bucketNames);
          setAvailableBuckets(bucketNames);
          
          // identity_documents 버킷 없으면 경고
          if (!bucketNames.includes('identity_documents')) {
            console.error("경고: 'identity_documents' 버킷이 존재하지 않습니다!");
          }
        }
      } catch (error) {
        console.error("버킷 확인 중 오류:", error);
      }
    };
    
    checkBuckets();
  }, []);
  
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
            
            // 버킷과 경로 추출 로직 개선
            let bucket = '';
            let objectPath = '';
            
            // v1/object/public/{bucket}/{path} 형식 처리
            const publicIndex = pathParts.findIndex(part => part === 'public');
            if (publicIndex > 0 && publicIndex < pathParts.length - 1) {
              bucket = pathParts[publicIndex + 1];
              objectPath = pathParts.slice(publicIndex + 2).join('/');
              
              console.log(`이미지 URL 분석 - 요청 ID: ${request.id}`, {
                url: request.id_front_url,
                bucket,
                path: objectPath,
                pathParts
              });
              
              newImageUrls[request.id] = {
                url: request.id_front_url,
                path: objectPath
              };
              
              // 파일 존재 여부 확인
              if (!availableBuckets.includes(bucket)) {
                console.error(`버킷 '${bucket}'이 존재하지 않습니다! 이미지를 로드할 수 없습니다.`);
                setImageErrors(prev => ({ ...prev, [request.id]: true }));
              } else {
                // 직접 파일 목록 확인 방식으로 변경
                const pathSegments = objectPath.split('/');
                const fileName = pathSegments.pop() || '';
                const folderPath = pathSegments.join('/');
                
                const { data: files, error: listError } = await supabase.storage
                  .from(bucket)
                  .list(folderPath, {
                    limit: 100,
                    sortBy: { column: 'name', order: 'asc' },
                  });
                  
                if (listError) {
                  console.error(`파일 목록 조회 오류 - 요청 ID: ${request.id}`, listError);
                  setImageErrors(prev => ({ ...prev, [request.id]: true }));
                } else {
                  const fileFound = files.some(file => file.name === fileName);
                  console.log(`파일 존재 여부 확인 결과 - 요청 ID: ${request.id}`, { 
                    exists: fileFound, 
                    bucket, 
                    folderPath, 
                    fileName,
                    filesInFolder: files.map(f => f.name)
                  });
                  
                  if (!fileFound) {
                    setImageErrors(prev => ({ ...prev, [request.id]: true }));
                  }
                }
              }
            } else {
              console.error(`URL 형식 오류 - 요청 ID: ${request.id}`, { url: request.id_front_url });
              setImageErrors(prev => ({ ...prev, [request.id]: true }));
            }
            
            newImageLoading[request.id] = false;
          } catch (error) {
            console.error(`URL 파싱 오류 - 요청 ID: ${request.id}:`, error);
            setImageErrors(prev => ({ ...prev, [request.id]: true }));
            newImageLoading[request.id] = false;
          }
        }
      }
      
      setImageUrls(newImageUrls);
      setImageLoading(newImageLoading);
    };
    
    if (identityRequests.length > 0 && availableBuckets.length > 0) {
      processImageUrls();
    }
  }, [identityRequests, availableBuckets]);
  
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
        description: language === 'ko' ? '요청이 거부되었습니다.' : 'リクエ스トが拒否されました。'
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

  const handleRetryImage = async (id: string, url: string) => {
    setRetrying(prev => ({ ...prev, [id]: true }));
    setImageErrors(prev => ({ ...prev, [id]: false }));
    
    try {
      // URL 정보 분석
      const imgUrl = imageUrls[id];
      if (imgUrl) {
        console.log(`파일 재확인 시작 - 요청 ID: ${id}`, imgUrl);

        // 버킷 목록 다시 확인
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
          console.error("버킷 목록 재확인 오류:", bucketError);
          throw bucketError;
        }

        // URL에서 버킷 이름과 경로 추출
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');
        const publicIndex = pathParts.findIndex(part => part === 'public');
        
        if (publicIndex > 0 && publicIndex < pathParts.length - 1) {
          const bucket = pathParts[publicIndex + 1];
          const objectPath = pathParts.slice(publicIndex + 2).join('/');
          
          // 버킷 존재 확인
          const bucketExists = buckets.some(b => b.name === bucket);
          if (!bucketExists) {
            console.error(`버킷 '${bucket}'이 존재하지 않습니다!`);
            throw new Error(`버킷 '${bucket}'이 존재하지 않습니다!`);
          }
          
          // 새 임시 URL 생성 (캐시 우회)
          const timestamp = new Date().getTime();
          const { data: newUrlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(objectPath, { transform: { width: 800, quality: 80, format: 'auto' } });
          
          if (newUrlData?.publicUrl) {
            const newUrl = `${newUrlData.publicUrl}?t=${timestamp}`;
            console.log("새로운 URL 생성:", newUrl);
            
            // 이미지 URL 업데이트
            const updatedRequest = identityRequests.find(req => req.id === id);
            if (updatedRequest) {
              const { error: updateError } = await supabase
                .from('identity_verifications')
                .update({ 
                  id_front_url: newUrlData.publicUrl,
                  updated_at: new Date().toISOString() 
                })
                .eq('id', id);
                
              if (updateError) {
                console.error("URL 업데이트 오류:", updateError);
              } else {
                console.log("URL 업데이트 성공");
                // 부모 컴포넌트의 onRefresh 호출하여 데이터 새로고침
                onRefresh();
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("이미지 재시도 중 오류:", error);
    } finally {
      // 이미지를 다시 로드하기 위해 타임아웃 사용
      setTimeout(() => {
        setRetrying(prev => ({ ...prev, [id]: false }));
      }, 1500);
    }
  };
  
  const regeneratePublicUrl = async (id: string, url: string) => {
    try {
      setProcessingId(id);
      
      // URL에서 버킷과 경로 추출
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const publicIndex = pathParts.findIndex(part => part === 'public');
      
      if (publicIndex > 0 && publicIndex < pathParts.length - 1) {
        const bucket = pathParts[publicIndex + 1];
        const objectPath = pathParts.slice(publicIndex + 2).join('/');
        
        console.log("URL 재생성 시도:", { bucket, path: objectPath });
        
        // 새 공개 URL 생성
        const { data: newUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(objectPath);
        
        if (newUrlData?.publicUrl) {
          console.log("새 URL 생성됨:", newUrlData.publicUrl);
          
          // DB에 새 URL 업데이트
          const { error: updateError } = await supabase
            .from('identity_verifications')
            .update({ 
              id_front_url: newUrlData.publicUrl,
              updated_at: new Date().toISOString() 
            })
            .eq('id', id);
            
          if (updateError) {
            console.error("URL 업데이트 오류:", updateError);
            throw updateError;
          }
          
          // 목록 새로고침
          onRefresh();
          
          toast({
            title: language === 'ko' ? 'URL 재생성 완료' : 'URL再生成完了',
            description: language === 'ko' ? 'URL이 성공적으로 재생성되었습니다.' : 'URLが正常に再生成されました。'
          });
        }
      } else {
        throw new Error("URL 형식 오류: 버킷과 경로를 추출할 수 없습니다.");
      }
    } catch (error) {
      console.error("URL 재생성 오류:", error);
      toast({
        title: t("error.generic"),
        description: language === 'ko' ? "URL을 재생성하는 중 오류가 발생했습니다." : "URLの再生成中にエラーが発生しました。",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t("admin.identity_verification")}</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex gap-1 items-center"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            {language === 'ko' ? '새로고침' : '更新'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm font-medium text-amber-800">
            {language === 'ko' 
              ? '스토리지 버킷 상태: ' + (availableBuckets.includes('identity_documents') 
                ? '정상' 
                : '문제 발생 (identity_documents 버킷이 존재하지 않습니다)')
              : 'ストレージバケットの状態: ' + (availableBuckets.includes('identity_documents') 
                ? '正常' 
                : '問題発生 (identity_documentsバケットが存在しません)')}
          </p>
          <p className="text-xs text-amber-700 mt-1">
            {language === 'ko' 
              ? '사용 가능한 버킷: ' + availableBuckets.join(', ')
              : '利用可能なバケット: ' + availableBuckets.join(', ')}
          </p>
        </div>
        
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
                            <div className="flex gap-2 mt-3">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleRetryImage(request.id, request.id_front_url || "")}
                                disabled={retrying[request.id] || processingId === request.id}
                              >
                                {retrying[request.id] ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {language === 'ko' ? '시도 중...' : '試行中...'}
                                  </>
                                ) : (
                                  language === 'ko' ? '다시 시도' : '再試行'
                                )}
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => regeneratePublicUrl(request.id, request.id_front_url || "")}
                                disabled={retrying[request.id] || processingId === request.id}
                              >
                                {processingId === request.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {language === 'ko' ? '처리 중...' : '処理中...'}
                                  </>
                                ) : (
                                  language === 'ko' ? 'URL 재생성' : 'URL再生成'
                                )}
                              </Button>
                            </div>
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
                        
                        <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded-md">
                          <p className="text-xs text-gray-500 break-all">
                            {request.id_front_url}
                          </p>
                        </div>
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

