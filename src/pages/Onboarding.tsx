
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { NationalitySelection } from "@/components/onboarding/NationalitySelection";
import { PhotoUpload } from "@/components/onboarding/PhotoUpload";
import { BasicInfo } from "@/components/onboarding/BasicInfo";
import { Questions } from "@/components/onboarding/Questions";
import { Verification } from "@/components/onboarding/Verification";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/i18n/useLanguage";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Onboarding = () => {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const currentStep = parseInt(step || "1", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const TOTAL_STEPS = 5; // Updated total steps

  const handleStepComplete = async (nextStep: number) => {
    setIsUpdating(true);
    
    try {
      if (user) {
        // 로그인한 경우만 DB 업데이트
        const { error } = await supabase.rpc(
          'update_user_onboarding_step',
          { 
            user_id: user.id,
            step_number: nextStep,
            is_completed: nextStep > TOTAL_STEPS
          }
        );
        
        if (error) throw error;
      }
      
      // 로그인 상태와 관계없이 다음 단계로 이동
      if (nextStep > TOTAL_STEPS) {
        // 온보딩 완료 후 홈으로 이동
        navigate('/home');
      } else {
        // 다음 온보딩 단계로 이동
        navigate(`/onboarding/${nextStep}`);
      }
      
    } catch (error) {
      console.error("Error updating onboarding step:", error);
      toast({
        title: t("error.generic"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      navigate(`/onboarding/${currentStep - 1}`);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <NationalitySelection onComplete={() => handleStepComplete(2)} />;
      case 2:
        return <PhotoUpload onComplete={() => handleStepComplete(3)} />;
      case 3:
        return <BasicInfo onComplete={() => handleStepComplete(4)} />;
      case 4:
        return <Questions onComplete={() => handleStepComplete(5)} />;
      case 5:
        return <Verification onComplete={() => handleStepComplete(6)} />;
      default:
        return <NationalitySelection onComplete={() => handleStepComplete(2)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pastel-pink/10 to-pastel-lavender/20">
      <div className="container max-w-lg mx-auto py-12 px-4 sm:px-6">
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
          {currentStep > 1 && (
            <Button 
              variant="ghost" 
              onClick={handlePreviousStep} 
              className="mb-4 p-2"
              aria-label={t("onboarding.previous")}
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>{t("onboarding.previous")}</span>
            </Button>
          )}
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
