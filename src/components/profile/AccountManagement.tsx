import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/useLanguage";
import { Loader2, LogOut, UserX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function AccountManagement() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut();
      navigate("/login");
      toast({
        title: language === "ko" ? "로그아웃 성공" : "ログアウト成功",
        description: language === "ko" ? "안전하게 로그아웃되었습니다" : "安全にログアウトされました",
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: language === "ko" ? "오류 발생" : "エラーが発生しました",
        description: language === "ko" ? "로그아웃 중 문제가 발생했습니다" : "ログアウト中に問題が発生しました",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    
    setIsDeleting(true);
    try {
      // Edge function 호출하여 계정 삭제
      const { data, error } = await supabase.functions.invoke("delete-user-account", {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) {
        console.error("Delete account error:", error);
        throw new Error(error.message || "Failed to delete account");
      }
      
      if (!data.success) {
        throw new Error(data.error || "Failed to delete account");
      }
      
      // 로그아웃 처리
      await signOut();
      
      // 성공 메시지 표시
      toast({
        title: language === "ko" ? "계정 삭제 완료" : "アカウント削除完了",
        description: language === "ko" ? "계정이 성공적으로 삭제되었습니다" : "アカウントが正常に削除されました",
      });
      
      // 로그인 페이지로 리디렉션
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Delete account error:", error);
      toast({
        title: language === "ko" ? "오류 발생" : "エラーが発生しました",
        description: language === "ko" 
          ? `계정 삭제 중 문제가 발생했습니다: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
          : `アカウント削除中に問題が発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className="flex flex-col space-y-4">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex justify-start w-full"
        >
          {isLoggingOut ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {language === "ko" ? "로그아웃" : "ログアウト"}
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => setShowDeleteConfirm(true)}
          className="flex justify-start w-full text-destructive hover:text-destructive"
        >
          <UserX className="mr-2 h-4 w-4" />
          {language === "ko" ? "계정 삭제" : "アカウント削除"}
        </Button>
      </div>
      
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === "ko" ? "계정을 정말 삭제하시겠습니까?" : "本当にアカウントを削除しますか？"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === "ko" 
                ? "이 작업은 되돌릴 수 없으며 모든 데이터가 영구적으로 삭제됩니다. 계정 삭제 후에는 모든 정보를 복구할 수 없습니다." 
                : "この操作は元に戻せず、すべてのデータが永久に削除されます。アカウント削除後は、すべての情報を復元することはできません。"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === "ko" ? "취소" : "キャンセル"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <div className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {language === "ko" ? "삭제 중..." : "削除中..."}
                </div>
              ) : (
                language === "ko" ? "삭제" : "削除"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
