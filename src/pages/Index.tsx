
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check browser language preference to redirect to ko or ja
    const userLang = navigator.language.toLowerCase();
    const targetLang = userLang.includes("ja") ? "ja" : "ko";
    
    navigate(`/${targetLang}`);
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-pastel-pink/10 to-pastel-lavender/20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;
