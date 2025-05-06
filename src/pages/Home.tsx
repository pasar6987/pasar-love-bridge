
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  
  // Add debugging logs to track navigation process
  useEffect(() => {
    console.log("[Home Debug] Home page loaded, redirecting to recommendations");
    navigate('/recommendations');
  }, [navigate]);
  
  console.log("[Home Debug] Home component rendered");
  
  return null;
}
