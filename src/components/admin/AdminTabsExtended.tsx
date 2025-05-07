import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileVerificationList } from "@/components/admin/ProfileVerificationList";
import { IdentityVerificationList } from "@/components/admin/IdentityVerificationList";
import { BioApprovalList } from "@/components/admin/BioApprovalList";
import { DebugInfoCard } from "@/components/admin/DebugInfoCard";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function AdminTabsExtended() {
  const { user } = useAuth();
  const [photoRequests, setPhotoRequests] = useState<any[]>([]);
  const [identityRequests, setIdentityRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);

  useEffect(() => {
    // Check admin status
    const checkAdminStatus = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('admin_users')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        setIsAdmin(!!data);
        setAdminCheckComplete(true);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdminStatus();
  }, [user]);

  useEffect(() => {
    // Fetch verification requests
    const fetchVerificationRequests = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch photo verification requests
        const { data: photoData, error: photoError } = await supabase
          .from('verification_requests')
          .select('*, users(id, nickname)')
          .eq('type', 'profile_photo')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
          
        if (photoError) throw photoError;
        
        // Transform data for easier use in the component
        const formattedPhotoRequests = (photoData || []).map((request: any) => ({
          ...request,
          user_display_name: request.user_display_name || request.users?.nickname || 'Unknown User'
        }));
        
        setPhotoRequests(formattedPhotoRequests);
        
        // Fetch identity verification requests
        const { data: idData, error: idError } = await supabase
          .from('identity_verifications')
          .select('*, users(id, nickname)')
          .eq('status', 'submitted')
          .order('created_at', { ascending: false });
          
        if (idError) throw idError;
        
        // Transform data for easier use
        const formattedIdRequests = (idData || []).map((request: any) => ({
          ...request,
          user_display_name: request.users?.nickname || 'Unknown User',
          type: 'identity'
        }));
        
        setIdentityRequests(formattedIdRequests);
      } catch (error) {
        console.error("Error fetching verification requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVerificationRequests();
  }, [user]);

  const handleRefresh = async () => {
    if (user) {
      setLoading(true);
      try {
        // Refresh photo verification requests
        const { data: photoData } = await supabase
          .from('verification_requests')
          .select('*, users(id, nickname)')
          .eq('type', 'profile_photo')
          .eq('status', 'pending')
          .order('created_at', { ascending: false });

        const formattedPhotoRequests = (photoData || []).map((request: any) => ({
          ...request,
          user_display_name: request.user_display_name || request.users?.nickname || 'Unknown User'
        }));
        
        setPhotoRequests(formattedPhotoRequests);
        
        // Refresh identity verification requests
        const { data: idData } = await supabase
          .from('identity_verifications')
          .select('*, users(id, nickname)')
          .eq('status', 'submitted')
          .order('created_at', { ascending: false });
        
        const formattedIdRequests = (idData || []).map((request: any) => ({
          ...request,
          user_display_name: request.users?.nickname || 'Unknown User',
          type: 'identity'
        }));
        
        setIdentityRequests(formattedIdRequests);
      } catch (error) {
        console.error("Error refreshing verification requests:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Tabs defaultValue="profile-verifications" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="profile-verifications">프로필 승인</TabsTrigger>
        <TabsTrigger value="identity-verifications">신분증 인증</TabsTrigger>
        <TabsTrigger value="bio-approvals">자기소개 승인</TabsTrigger>
        <TabsTrigger value="debug">디버그</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile-verifications">
        <ProfileVerificationList photoRequests={photoRequests} loading={loading} onRefresh={handleRefresh} />
      </TabsContent>
      
      <TabsContent value="identity-verifications">
        <IdentityVerificationList identityRequests={identityRequests} loading={loading} onRefresh={handleRefresh} />
      </TabsContent>

      <TabsContent value="bio-approvals">
        <BioApprovalList />
      </TabsContent>
      
      <TabsContent value="debug">
        <DebugInfoCard user={user} isAdmin={isAdmin} adminCheckComplete={adminCheckComplete} loading={loading} />
      </TabsContent>
    </Tabs>
  );
}
