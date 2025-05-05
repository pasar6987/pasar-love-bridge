
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";

// Pages
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import ProfileDetail from "./pages/ProfileDetail";
import MatchRequests from "./pages/MatchRequests";
import Chat from "./pages/Chat";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import UserProfile from "./pages/UserProfile";
import Admin from "./pages/Admin";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Routes>
              {/* 메인 랜딩 페이지 */}
              <Route path="/" element={<Index />} />
              
              {/* 로그인 페이지 */}
              <Route path="/login" element={<Login />} />
              
              {/* 온보딩 페이지 */}
              <Route path="/onboarding/:step" element={<Onboarding />} />
              
              {/* 메인 페이지들 */}
              <Route path="/home" element={<Home />} />
              
              {/* 프로필 페이지 */}
              <Route path="/profile/:id" element={<ProfileDetail />} />
              
              {/* 유저 프로필 페이지 (마이페이지) */}
              <Route path="/mypage" element={<UserProfile />} />
              
              {/* 매치 페이지 */}
              <Route path="/matches" element={<MatchRequests />} />
              
              {/* 채팅 페이지 */}
              <Route path="/chat" element={<Chat />} />
              <Route path="/chat/:id" element={<Chat />} />
              
              {/* 알림 페이지 */}
              <Route path="/notifications" element={<Notifications />} />
              
              {/* 설정 페이지 */}
              <Route path="/settings" element={<Settings />} />
              
              {/* 관리자 페이지 */}
              <Route path="/admin" element={<Admin />} />
              
              {/* 404 페이지 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
