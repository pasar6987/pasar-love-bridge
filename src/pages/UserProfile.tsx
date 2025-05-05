
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, UserCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function UserProfile() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      // 토스트 메시지는 AuthContext에서 처리됨
    } catch (error) {
      toast({
        title: t("auth.logout_failed"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  const navigateToSettings = () => {
    navigate('/settings');
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <h1 className="text-3xl font-bold mb-8">
          {t("profile.mypage")}
        </h1>

        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="bg-primary/10">
                <UserCircle className="h-12 w-12 text-primary" />
              </AvatarFallback>
              {user.user_metadata?.avatar_url && (
                <AvatarImage src={user.user_metadata.avatar_url} alt={user.user_metadata?.full_name || user.email || ""} />
              )}
            </Avatar>
            <div>
              <CardTitle className="text-2xl">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{user.email}</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">
                {t("profile.basic_info")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.email")}
                  </p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {t("profile.join_date")}
                  </p>
                  <p>{new Date(user.created_at || "").toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={navigateToSettings}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Settings className="h-4 w-4" />
                {t("nav.settings")}
              </Button>
              <Button 
                onClick={handleLogout}
                className="flex items-center gap-2"
                variant="destructive"
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                    {t("profile.logout_in_progress")}
                  </>
                ) : (
                  <>
                    <LogOut className="h-4 w-4" />
                    {t("settings.logout")}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
