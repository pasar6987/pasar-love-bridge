import { supabase } from "@/integrations/supabase/client";

// Interface for verification status response
export interface VerificationStatus {
  is_verified: boolean;
  verification_status: string;
}

// Function to check user's verification status
export const checkVerificationStatus = async (): Promise<VerificationStatus> => {
  try {
    const { data, error } = await supabase.functions.invoke('get_user_verification_status');
    
    if (error) {
      console.error("Error checking verification status:", error);
      throw error;
    }
    
    return data as VerificationStatus;
  } catch (error) {
    console.error("Error in checkVerificationStatus:", error);
    // Default to not verified in case of error
    return { is_verified: false, verification_status: 'error' };
  }
};

// Function to check if a user can access chat
export const canAccessChat = async (): Promise<{
  canAccess: boolean;
  verificationStatus: string;
}> => {
  try {
    const status = await checkVerificationStatus();
    // User can access chat ONLY if they're verified
    return {
      canAccess: status.is_verified,
      verificationStatus: status.verification_status
    };
  } catch (error) {
    console.error("Error checking chat access:", error);
    return { canAccess: false, verificationStatus: 'error' };
  }
};

// This function remains unchanged - recommendations access doesn't require verification
export const canAccessRecommendations = async (): Promise<boolean> => {
  try {
    const status = await checkVerificationStatus();
    // User can access recommendations if they're verified OR if verification is still in progress
    return status.is_verified || ['submitted', 'pending'].includes(status.verification_status);
  } catch (error) {
    console.error("Error checking recommendation access:", error);
    return false;
  }
};
