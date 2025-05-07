
import React from "react";
import { useLanguage } from "@/i18n/useLanguage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, X, Upload } from "lucide-react";
import { Button } from "./ui/button";

interface ProfilePhotoGridProps {
  photos: string[];
  isPendingApproval?: (url: string) => boolean;
  onAddPhoto: () => void;
  onRemovePhoto: (index: number) => void;
  onUpdatePhoto: (index: number) => void;
  isUploading?: boolean;
  editable?: boolean;
  maxPhotos?: number;
}

const ProfilePhotoGrid = ({
  photos,
  isPendingApproval = () => false,
  onAddPhoto,
  onRemovePhoto,
  onUpdatePhoto,
  isUploading = false,
  editable = true,
  maxPhotos = 9
}: ProfilePhotoGridProps) => {
  const { language } = useLanguage();

  const pendingMessage = language === 'ko' ? '검토중입니다' : '審査中です';
  const addPhotoText = language === 'ko' ? '사진 추가' : '写真追加';
  const confirmDeleteText = language === 'ko' ? '사진을 삭제하시겠습니까?' : '写真を削除しますか？';

  const handleRemovePhoto = (index: number) => {
    if (window.confirm(confirmDeleteText)) {
      onRemovePhoto(index);
    }
  };

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo, index) => (
        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
          <img
            src={photo}
            alt={`Profile ${index + 1}`}
            className="w-full h-full object-cover"
          />
          
          {isPendingApproval(photo) && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-sm font-medium">
              {pendingMessage}
            </div>
          )}
          
          {editable && (
            <>
              <button
                onClick={() => onUpdatePhoto(index)}
                className="absolute bottom-2 right-10 p-1 bg-white/80 rounded-full text-gray-700 hover:bg-white"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleRemovePhoto(index)}
                className="absolute bottom-2 right-2 p-1 bg-white/80 rounded-full text-gray-700 hover:bg-white"
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ))}

      {editable && photos.length < maxPhotos && (
        <button
          onClick={onAddPhoto}
          className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 transition-colors"
          disabled={isUploading}
        >
          <Plus className="h-6 w-6 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500">{addPhotoText}</span>
        </button>
      )}
      
      {isUploading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm">{language === 'ko' ? '업로드 중...' : 'アップロード中...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePhotoGrid;
