
import { useContext } from "react";
import { LanguageContext } from "./LanguageContext";
import { LanguageContextProps } from "./types";

export const useLanguage = (): LanguageContextProps => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
