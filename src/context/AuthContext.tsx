
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/i18n/useLanguage";

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // 디버깅을 위한 로그 함수
  const logAuthDebug = (message: string, data?: any) => {
    console.log(`[Auth Debug] ${message}`, data || '');
  };

  useEffect(() => {
    logAuthDebug("AuthContext 초기화");
    
    let mounted = true;
    
    // Set up auth state listener first - this is using Supabase's built-in auth functions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        
        logAuthDebug(`Auth state changed: ${event}`, { userId: newSession?.user?.id });
        
        if (newSession !== session) {
          setSession(newSession);
          setUser(newSession?.user ?? null);
        }
        
        // User sign-in event, check onboarding status and redirect accordingly
        if (event === 'SIGNED_IN' && newSession?.user?.id) {
          logAuthDebug("User signed in, checking onboarding status");
          // Use setTimeout to avoid deadlock with the onAuthStateChange listener
          setTimeout(() => {
            // Check user's onboarding status
            if (newSession?.user?.id) {
              checkUserOnboardingStatus(newSession.user.id);
            }
          }, 0);
        }
      }
    );

    // Then check for existing session - this is using Supabase's built-in auth functions
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        logAuthDebug("세션 확인 결과", { exists: !!initialSession, userId: initialSession?.user?.id });
        
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            checkUserOnboardingStatus(initialSession.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        logAuthDebug("세션 확인 중 오류 발생", error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
      logAuthDebug("Auth subscription unsubscribe");
      subscription.unsubscribe();
    };
  }, []);

  const checkUserOnboardingStatus = async (userId: string | undefined) => {
    logAuthDebug("사용자 온보딩 상태 확인 시작", { userId });
    if (!userId) {
      logAuthDebug("유효한 사용자 ID가 없음");
      setLoading(false);
      return;
    }
    
    try {
      // Use RPC function to get user onboarding status - already using RPC
      logAuthDebug("get_user_onboarding_status RPC 호출");
      const { data: userData, error } = await supabase.rpc(
        'get_user_onboarding_status',
        { user_id: userId }
      );
      
      if (error) {
        logAuthDebug("온보딩 상태 조회 오류", error);
        throw error;
      }
      
      logAuthDebug("온보딩 상태 조회 결과", userData);
      
      if (!userData || userData.length === 0) {
        // User record doesn't exist yet, create it - already using RPC
        logAuthDebug("사용자 프로필이 없음, 새로 생성");
        const { error: insertError } = await supabase.rpc(
          'upsert_user_profile',
          { user_id: userId }
        );
        
        if (insertError) {
          logAuthDebug("사용자 프로필 생성 오류", insertError);
          throw insertError;
        }
        
        logAuthDebug("온보딩 1단계로 리디렉션");
        navigate('/onboarding/1');
      } else {
        const userProfile = userData[0];
        logAuthDebug("사용자 프로필 확인됨", userProfile);
        if (!userProfile.onboarding_completed) {
          // 온보딩이 완료되지 않은 경우, 마지막 단계로 리디렉션
          const nextStep = userProfile.onboarding_step ? userProfile.onboarding_step : 1;
          logAuthDebug(`온보딩 ${nextStep}단계로 리디렉션`);
          navigate(`/onboarding/${nextStep}`);
        } else {
          logAuthDebug("온보딩 완료됨");
        }
      }
    } catch (error) {
      console.error("사용자 온보딩 상태 확인 오류:", error);
      logAuthDebug("사용자 온보딩 상태 확인 오류", error);
      toast({
        title: t("error.generic"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Using Supabase's built-in auth functions
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) throw error;
      
    } catch (error) {
      console.error("Google 로그인 오류:", error);
      toast({
        title: t("auth.login_failed"),
        description: t("auth.try_again"),
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      // Using Supabase's built-in auth function
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Changed from '/' to '/login'
      navigate('/login');
      
      toast({
        title: t("auth.logout_success"),
        description: t("auth.logout_success_desc"),
      });
      
    } catch (error) {
      console.error("로그아웃 오류:", error);
      toast({
        title: t("auth.logout_failed"),
        description: t("error.try_again"),
        variant: "destructive"
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
