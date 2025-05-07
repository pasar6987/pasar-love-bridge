
import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function Settings() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    newMatches: true,
    messages: true,
    verificationStatus: true,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState({
    email: "",
    name: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // 사용자 데이터 로드
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // users 테이블에서 사용자 데이터 가져오기
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('nickname, gender, birthdate, city')
          .eq('id', user.id)
          .single();
        
        if (profileError && profileError.code !== 'PGRST116') {
          console.error("유저 프로필 데이터 가져오기 오류:", profileError);
        }

        setUserData({
          email: user.email || "",
          name: profileData?.nickname || user.user_metadata?.full_name || user.email?.split('@')[0] || "",
        });
      } catch (error) {
        console.error("사용자 데이터 로드 중 오류:", error);
        toast({
          title: t("error.generic"),
          description: t("error.try_again"),
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, t, toast]);

  // 사용자 이름 저장하기
  const handleSaveChanges = async () => {
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ nickname: userData.name })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: language === "ko" ? "변경사항이 저장되었습니다" : "変更が保存されました",
        description: language === "ko" ? "프로필이 업데이트 되었습니다" : "プロフィールが更新されました"
      });
    } catch (error) {
      console.error("변경사항 저장 중 오류:", error);
      toast({
        title: t("error.generic"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      // Changed from '/' to '/login'
      navigate('/login');
    }, 1000);
  };

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">{t("settings.title")}</h1>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.account")}</CardTitle>
              <CardDescription>
                {language === "ko" 
                  ? "계정 정보를 관리하세요"
                  : "アカウント情報を管理する"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email")}</Label>
                    <Input 
                      id="email" 
                      value={userData.email} 
                      disabled 
                      className="pasar-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("onboarding.basics.name")}</Label>
                    <Input 
                      id="name" 
                      value={userData.name} 
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      className="pasar-input"
                    />
                  </div>
                  <Button 
                    className="pasar-btn" 
                    onClick={handleSaveChanges} 
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {language === "ko" ? "저장 중..." : "保存中..."}
                      </span>
                    ) : (
                      language === "ko" ? "변경사항 저장" : "変更を保存"
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.language")}</CardTitle>
              <CardDescription>
                {language === "ko" 
                  ? "앱 언어를 선택하세요"
                  : "アプリの言語を選択してください"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select 
                defaultValue={language} 
                onValueChange={(value) => setLanguage(value as 'ko' | 'ja')}
              >
                <SelectTrigger className="pasar-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ko">한국어</SelectItem>
                  <SelectItem value="ja">日本語</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notifications")}</CardTitle>
              <CardDescription>
                {language === "ko" 
                  ? "알림 설정을 관리하세요"
                  : "通知設定を管理する"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-matches">
                  {language === "ko" ? "새로운 매치" : "新しいマッチ"}
                </Label>
                <Switch 
                  id="new-matches" 
                  checked={notifications.newMatches}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, newMatches: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="messages">
                  {language === "ko" ? "메시지" : "メッセージ"}
                </Label>
                <Switch 
                  id="messages" 
                  checked={notifications.messages}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, messages: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="verification-status">
                  {language === "ko" ? "인증 상태 업데이트" : "認証状況のアップデート"}
                </Label>
                <Switch 
                  id="verification-status" 
                  checked={notifications.verificationStatus}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, verificationStatus: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === "ko" ? "외부 연결" : "外部接続"}</CardTitle>
              <CardDescription>
                {language === "ko" 
                  ? "외부 서비스 연결을 관리하세요"
                  : "外部サービスの接続を管理する"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {language === "ko" ? "카카오톡 연결" : "KakaoTalk連携"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "ko" 
                      ? "카카오톡으로 알림을 받으세요"
                      : "KakaoTalkで通知を受け取る"}
                  </p>
                </div>
                <Button variant="outline" className="rounded-full">
                  {language === "ko" ? "연결하기" : "連携する"}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">
                    {language === "ko" ? "라인 연결" : "LINE連携"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {language === "ko" 
                      ? "라인으로 알림을 받으세요"
                      : "LINEで通知を受け取る"}
                  </p>
                </div>
                <Button variant="outline" className="rounded-full">
                  {language === "ko" ? "연결하기" : "連携する"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === "ko" ? "계정 관리" : "アカウント管理"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="destructive" 
                className="w-full rounded-full"
                onClick={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    {language === "ko" ? "로그아웃 중..." : "ログアウト中..."}
                  </span>
                ) : (
                  t("settings.logout")
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
