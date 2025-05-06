
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { useLanguage } from "@/i18n/useLanguage";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, UserCircle, Settings, UserX } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

export default function UserProfile() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      // Toast message is handled in AuthContext
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
  
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      console.log("Starting account deletion process");
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      
      if (!accessToken) {
        throw new Error("No access token available");
      }
      
      console.log("Session obtained, calling delete-user-account function");
      
      // Call the delete-user-account edge function with the token in the request body
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        method: 'POST',
        body: { token: accessToken },
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      console.log("Edge function response:", data, error);
      
      if (error) {
        console.error("Edge function error:", error);
        throw error;
      }
      
      if (data?.error) {
        console.error("Delete account error:", data.error);
        throw new Error(data.error);
      }
      
      // 성공적인 계정 삭제 후 로그아웃
      console.log("Account deleted successfully, signing out");
      await signOut();
      
      toast({
        title: t("profile.account_deleted"),
        description: t("profile.account_deleted_desc"),
      });
      
      navigate('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast({
        title: t("profile.delete_failed"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
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
                variant="outline"
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
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    className="flex items-center gap-2"
                  >
                    <UserX className="h-4 w-4" />
                    {t("profile.delete_account")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t("profile.confirm_delete")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {t("profile.delete_warning")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <>
                          <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                          {t("profile.deleting")}
                        </>
                      ) : (
                        t("profile.delete")
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
