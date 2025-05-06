
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  
  // Redirect to the recommendations page
  useEffect(() => {
    navigate('/recommendations');
  }, [navigate]);
  
  return null;
}
