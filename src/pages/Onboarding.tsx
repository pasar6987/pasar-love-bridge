
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { PhotoUpload } from "@/components/onboarding/PhotoUpload";
import { BasicInfo } from "@/components/onboarding/BasicInfo";
import { Questions } from "@/components/onboarding/Questions";
import { Verification } from "@/components/onboarding/Verification";
import { Heart } from "lucide-react";

export default function Onboarding() {
  const { step = "1" } = useParams<{ step: string }>();
  const currentStep = parseInt(step);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [animateDirection, setAnimateDirection] = useState<"in" | "out">("in");
  const TOTAL_STEPS = 4;

  useEffect(() => {
    setAnimateDirection("in");
  }, [currentStep]);

  const navigateToStep = (nextStep: number) => {
    setAnimateDirection("out");
    
    setTimeout(() => {
      if (nextStep > TOTAL_STEPS) {
        navigate("/home");
      } else {
        navigate(`/onboarding/${nextStep}`);
      }
    }, 300);
  };

  const handleNextStep = () => {
    navigateToStep(currentStep + 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PhotoUpload onComplete={handleNextStep} />;
      case 2:
        return <BasicInfo onComplete={handleNextStep} />;
      case 3:
        return <Questions onComplete={handleNextStep} />;
      case 4:
        return <Verification onComplete={() => navigate("/home")} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-pastel-pink/10 to-pastel-lavender/20 flex flex-col">
      <header className="p-6 flex items-center">
        <Heart className="h-6 w-6 text-pastel-pink mr-2" />
        <span className="text-xl font-bold font-hand">{t("app.name")}</span>
      </header>

      <div className="flex-grow flex items-center justify-center p-6">
        <div 
          className={`bg-white rounded-2xl shadow-soft p-8 max-w-2xl w-full transition-opacity duration-300 ${
            animateDirection === "out" ? "opacity-0" : "opacity-100"
          }`}
        >
          <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          {renderStepContent()}
        </div>
      </div>

      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Pasar. All rights reserved.
      </footer>
    </div>
  );
}
