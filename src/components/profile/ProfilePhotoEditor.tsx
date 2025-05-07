
import { useState, useRef } from "react";
import { useUploadPhotos, UploadPhotoResult } from "@/hooks/useUploadPhotos";
import { useLanguage } from "@/i18n/useLanguage";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Check, X } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface ProfilePhotoEditorProps {
  currentPhotoUrl: string | null;
  username: string;
}

export function ProfilePhotoEditor({ currentPhotoUrl, username }: ProfilePhotoEditorProps) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const { isUploading, updateProfilePhoto } = useUploadPhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSelectFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the selected image
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewPhoto(event.target?.result as string);
      setSelectedFile(file);
      setIsDialogOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;
    
    setIsSubmitting(true);
    
    try {
      const result: UploadPhotoResult = await updateProfilePhoto(selectedFile, 0);
      
      if (result.success) {
        toast({
          title: language === 'ko' ? '사진 업로드 성공' : '写真アップロード成功',
          description: language === 'ko' 
            ? '프로필 사진이 검토를 위해 제출되었습니다. 승인 후 반영됩니다.' 
            : 'プロフィール写真がレビューのために提出されました。承認後に反映されます。',
        });
        setIsDialogOpen(false);
        setSelectedFile(null);
        setPreviewPhoto(null);
        
        // Reload the page to show the "검토중입니다" status
        window.location.reload();
      } else {
        toast({
          title: language === 'ko' ? '업로드 실패' : 'アップロード失敗',
          description: result.error || (language === 'ko' ? '다시 시도해주세요.' : 'もう一度お試しください。'),
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error submitting photo:", error);
      toast({
        title: language === 'ko' ? '오류 발생' : 'エラーが発生しました',
        description: language === 'ko' ? '다시 시도해주세요.' : 'もう一度お試しください。',
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setSelectedFile(null);
    setPreviewPhoto(null);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <Avatar className="h-24 w-24 border-2 border-primary/20">
          <AvatarFallback>{username.slice(0, 2)}</AvatarFallback>
          {currentPhotoUrl && <AvatarImage src={currentPhotoUrl} alt={username} />}
        </Avatar>
        
        <Button 
          onClick={handleSelectFile} 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {language === 'ko' ? '업로드 중...' : 'アップロード中...'}
            </>
          ) : (
            <>
              <Camera className="h-4 w-4" />
              {language === 'ko' ? '프로필 사진 변경' : 'プロフィール写真を変更'}
            </>
          )}
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {language === 'ko' ? '프로필 사진 업데이트' : 'プロフィール写真の更新'}
            </DialogTitle>
            <DialogDescription>
              {language === 'ko' 
                ? '관리자 승인 후 변경사항이 적용됩니다.' 
                : '管理者の承認後に変更が適用されます。'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {previewPhoto && (
              <div className="rounded-lg overflow-hidden max-h-80 mx-auto">
                <img 
                  src={previewPhoto} 
                  alt="Preview" 
                  className="w-full h-auto object-contain"
                />
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                <X className="mr-2 h-4 w-4" />
                {language === 'ko' ? '취소' : 'キャンセル'}
              </Button>
              <Button
                type="button" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {language === 'ko' ? '제출하기' : '提出する'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
