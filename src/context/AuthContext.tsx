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
  const { language, t } = useLanguage();

  useEffect(() => {
    // Set up auth state listener first
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

    // Then check for existing session
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
      const { data: userData, error } = await supabase
        .from('users')
        .select('onboarding_completed, onboarding_step')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (!userData) {
        // User record doesn't exist yet, create it
        const { error: insertError } = await supabase
          .from('users')
          .insert({ id: userId })
          .single();
        
        if (insertError) throw insertError;
        
        // 새로운 사용자는 온보딩 페이지로 리디렉션
        navigate(`/${language}/onboarding/1`);
      } else if (!userData.onboarding_completed) {
        // 온보딩이 완료되지 않은 경우, 마지막 단계로 리디렉션
        const nextStep = userData.onboarding_step ? userData.onboarding_step : 1;
        navigate(`/${language}/onboarding/${nextStep}`);
      } else {
        // 온보딩이 완료된 경우 메인 페이지로 리디렉션
        navigate(`/${language}/home`);
      }
    } catch (error) {
      console.error("Error checking user onboarding status:", error);
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
      console.error("Error signing in with Google:", error);
      toast({
        title: t("auth.login_failed"),
        description: t("auth.try_again"),
        variant: "destructive"
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      navigate(`/${language}`);
      
    } catch (error) {
      console.error("Error signing out:", error);
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
