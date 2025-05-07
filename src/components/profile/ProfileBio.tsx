
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/useLanguage";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Check, Pen } from "lucide-react";

interface ProfileBioProps {
  initialBio: string | null;
  userId: string;
  isPendingApproval?: boolean;
}

export function ProfileBio({ initialBio, userId, isPendingApproval = false }: ProfileBioProps) {
  const { toast } = useToast();
  const { language } = useLanguage();
  const [bio, setBio] = useState(initialBio || "");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingApproval, setPendingApproval] = useState(isPendingApproval);

  const handleSave = async () => {
    if (!userId) return;
    
    setIsSaving(true);
    try {
      // First update the users table directly
      const { error } = await supabase
        .from('users')
        .update({ bio })
        .eq('id', userId);
        
      if (error) throw error;
      
      // Then create a verification request for admin approval
      const { error: requestError } = await supabase
        .from('verification_requests')
        .insert({
          user_id: userId,
          type: 'bio_update',
          status: 'pending',
        });
      
      if (requestError) {
        console.error("Failed to create verification request:", requestError);
      }
      
      toast({
        title: language === "ko" ? "저장 완료" : "保存完了",
        description: language === "ko" 
          ? "프로필이 저장되었습니다. 관리자 승인 후 공개됩니다." 
          : "プロフィールが保存されました。管理者の承認後に公開されます。",
      });
      
      setPendingApproval(true);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving bio:", error);
      toast({
        title: language === "ko" ? "오류 발생" : "エラーが発生しました",
        description: language === "ko" ? "저장 중 문제가 발생했습니다" : "保存中に問題が発生しました",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-semibold">
          {language === "ko" ? "자기소개" : "自己紹介"}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsEditing(!isEditing)}
          disabled={isSaving}
        >
          <Pen className="h-4 w-4" />
          <span className="sr-only">
            {language === "ko" ? "수정" : "編集"}
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={language === "ko" ? "자기소개를 작성해주세요" : "自己紹介を書いてください"}
              className="min-h-[120px]"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setBio(initialBio || "");
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                {language === "ko" ? "취소" : "キャンセル"}
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <div className="flex items-center">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === "ko" ? "저장 중..." : "保存中..."}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    {language === "ko" ? "저장" : "保存"}
                  </div>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div>
            {pendingApproval && (
              <div className="mb-2 text-sm px-3 py-1 bg-yellow-50 text-yellow-700 rounded-md inline-block">
                {language === "ko" ? "검토 중입니다" : "審査中です"}
              </div>
            )}
            <p className="text-muted-foreground whitespace-pre-wrap">
              {bio || (language === "ko" ? "자기소개가 없습니다" : "自己紹介がありません")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
