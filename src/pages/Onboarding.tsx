
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { PhotoUpload } from "@/components/onboarding/PhotoUpload";
import { BasicInfo } from "@/components/onboarding/BasicInfo";
import { Questions } from "@/components/onboarding/Questions";
import { Verification } from "@/components/onboarding/Verification";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

const Onboarding = () => {
  const { step } = useParams<{ step: string }>();
  const navigate = useNavigate();
  const currentStep = parseInt(step || "1", 10);
  const { user } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const TOTAL_STEPS = 4;

  const handleStepComplete = async (nextStep: number) => {
    setIsUpdating(true);
    
    try {
      if (user) {
        // 로그인한 경우만 DB 업데이트
        const { error } = await supabase
          .from('users')
          .update({ 
            onboarding_step: nextStep,
            onboarding_completed: nextStep > TOTAL_STEPS
          })
          .eq('id', user.id);
        
        if (error) throw error;
      }
      
      // 로그인 상태와 관계없이 다음 단계로 이동
      if (nextStep > TOTAL_STEPS) {
        window.location.href = `/${language}/home`;
      } else {
        window.location.href = `/${language}/onboarding/${nextStep}`;
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PhotoUpload onComplete={() => handleStepComplete(2)} />;
      case 2:
        return <BasicInfo onComplete={() => handleStepComplete(3)} />;
      case 3:
        return <Questions onComplete={() => handleStepComplete(4)} />;
      case 4:
        return <Verification onComplete={() => handleStepComplete(5)} />;
      default:
        return <PhotoUpload onComplete={() => handleStepComplete(2)} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pastel-pink/10 to-pastel-lavender/20">
      <div className="container max-w-lg mx-auto py-12 px-4 sm:px-6">
        <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
