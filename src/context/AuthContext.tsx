
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

  useEffect(() => {
    // Set up auth state listener first - this is using Supabase's built-in auth functions
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // User sign-in event, check onboarding status and redirect accordingly
        if (event === 'SIGNED_IN') {
          // Use setTimeout to avoid deadlock with the onAuthStateChange listener
          setTimeout(() => {
            // Check user's onboarding status
            if (session?.user?.id) {
              checkUserOnboardingStatus(session.user.id);
            }
          }, 0);
        }
      }
    );

    // Then check for existing session - this is using Supabase's built-in auth functions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkUserOnboardingStatus(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const checkUserOnboardingStatus = async (userId: string | undefined) => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    try {
      // Use RPC function to get user onboarding status - already using RPC
      const { data: userData, error } = await supabase.rpc(
        'get_user_onboarding_status',
        { user_id: userId }
      );
      
      if (error) throw error;
      
      if (!userData || userData.length === 0) {
        // User record doesn't exist yet, create it - already using RPC
        const { error: insertError } = await supabase.rpc(
          'upsert_user_profile',
          { user_id: userId }
        );
        
        if (insertError) throw insertError;
        
        // 새로운 사용자는 온보딩 페이지로 리디렉션
        navigate('/onboarding/1');
      } else {
        const userProfile = userData[0];
        if (!userProfile.onboarding_completed) {
          // 온보딩이 완료되지 않은 경우, 마지막 단계로 리디렉션
          const nextStep = userProfile.onboarding_step ? userProfile.onboarding_step : 1;
          navigate(`/onboarding/${nextStep}`);
        }
      }
    } catch (error) {
      console.error("사용자 온보딩 상태 확인 오류:", error);
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
      
      navigate('/');
      
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
