
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/context/LanguageContext";
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
              {/* 기본 리디렉션 라우트 */}
              <Route path="/" element={<Index />} />
              
              {/* 로그인 페이지 */}
              <Route path="/ko" element={<Login />} />
              <Route path="/ja" element={<Login />} />
              
              {/* 온보딩 페이지 */}
              <Route path="/ko/onboarding/:step" element={<Onboarding />} />
              <Route path="/ja/onboarding/:step" element={<Onboarding />} />
              <Route path="/onboarding/:step" element={<Navigate to="/ko/onboarding/1" replace />} />
              
              {/* 메인 페이지들 */}
              <Route path="/ko/home" element={<Home />} />
              <Route path="/ja/home" element={<Home />} />
              <Route path="/home" element={<Navigate to="/ko/home" replace />} />
              
              {/* 프로필 페이지 */}
              <Route path="/ko/profile/:id" element={<ProfileDetail />} />
              <Route path="/ja/profile/:id" element={<ProfileDetail />} />
              <Route path="/profile/:id" element={<Navigate to="/ko/profile/:id" replace />} />
              
              {/* 매치 페이지 */}
              <Route path="/ko/matches" element={<MatchRequests />} />
              <Route path="/ja/matches" element={<MatchRequests />} />
              <Route path="/matches" element={<Navigate to="/ko/matches" replace />} />
              
              {/* 채팅 페이지 */}
              <Route path="/ko/chat" element={<Chat />} />
              <Route path="/ja/chat" element={<Chat />} />
              <Route path="/ko/chat/:id" element={<Chat />} />
              <Route path="/ja/chat/:id" element={<Chat />} />
              <Route path="/chat" element={<Navigate to="/ko/chat" replace />} />
              <Route path="/chat/:id" element={<Navigate to="/ko/chat/:id" replace />} />
              
              {/* 알림 페이지 */}
              <Route path="/ko/notifications" element={<Notifications />} />
              <Route path="/ja/notifications" element={<Notifications />} />
              <Route path="/notifications" element={<Navigate to="/ko/notifications" replace />} />
              
              {/* 설정 페이지 */}
              <Route path="/ko/settings" element={<Settings />} />
              <Route path="/ja/settings" element={<Settings />} />
              <Route path="/settings" element={<Navigate to="/ko/settings" replace />} />
              
              {/* 404 페이지 */}
              <Route path="/ko/*" element={<NotFound />} />
              <Route path="/ja/*" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/ko/404" replace />} />
            </Routes>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
