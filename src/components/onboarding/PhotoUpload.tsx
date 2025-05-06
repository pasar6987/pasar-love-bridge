
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/useLanguage";
import { X, Loader2 } from "lucide-react";
import { useUploadPhotos } from "@/hooks/useUploadPhotos";

interface PhotoUploadProps {
  onComplete: () => void;
}

export function PhotoUpload({ onComplete }: PhotoUploadProps) {
  const { t } = useLanguage();
  const { photos, isUploading, handleFileUpload, removePhoto } = useUploadPhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileUpload(e.target.files);
    // Reset the input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-2">
          {t("onboarding.photos.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("onboarding.photos.desc")}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {photos.map((photo, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
            <img 
              src={photo} 
              alt={`Profile photo ${index + 1}`} 
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => removePhoto(index)}
              className="absolute top-2 right-2 bg-black/50 rounded-full p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        
        {photos.length < 6 && (
          <button
            type="button"
            onClick={handleButtonClick}
            className="border-2 border-dashed border-gray-300 rounded-xl aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
            disabled={isUploading}
          >
            <div className="text-center p-4">
              {isUploading ? (
                <div className="w-12 h-12 rounded-full bg-pastel-pink/20 flex items-center justify-center mx-auto mb-2">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-pastel-pink/20 flex items-center justify-center mx-auto mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="w-6 h-6 text-primary"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
              )}
              <span className="text-sm font-medium text-gray-600">
                {t("onboarding.photos.add")}
              </span>
            </div>
          </button>
        )}
      </div>
      
      {photos.length < 3 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-700">
          {t("onboarding.photos.min_required")}
        </div>
      )}
      
      <div className="flex justify-end mt-8">
        <Button
          onClick={onComplete}
          className="pasar-btn"
          disabled={photos.length < 3 || isUploading}
        >
          {t("action.next")}
        </Button>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
        disabled={isUploading}
      />
    </div>
  );
}
