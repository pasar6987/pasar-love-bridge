import React from 'react';
import { useLanguage } from "@/i18n/useLanguage";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
}

export function ProgressBar({ currentStep, totalSteps }: ProgressBarProps) {
  const { t } = useLanguage();
  
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">
          {t("onboarding.step")} {currentStep}/{totalSteps}
        </span>
        <span className="text-sm font-medium text-primary">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full">
        <div 
          className="h-2 bg-primary rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}
