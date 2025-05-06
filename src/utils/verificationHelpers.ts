
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
