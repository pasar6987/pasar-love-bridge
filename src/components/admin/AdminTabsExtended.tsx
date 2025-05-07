
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProfileVerificationList from "@/components/admin/ProfileVerificationList";
import IdentityVerificationList from "@/components/admin/IdentityVerificationList";
import { BioApprovalList } from "@/components/admin/BioApprovalList";
import DebugInfoCard from "@/components/admin/DebugInfoCard";

export function AdminTabsExtended() {
  return (
    <Tabs defaultValue="profile-verifications" className="w-full">
      <TabsList className="grid grid-cols-4 mb-8">
        <TabsTrigger value="profile-verifications">프로필 승인</TabsTrigger>
        <TabsTrigger value="identity-verifications">신분증 인증</TabsTrigger>
        <TabsTrigger value="bio-approvals">자기소개 승인</TabsTrigger>
        <TabsTrigger value="debug">디버그</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile-verifications">
        <ProfileVerificationList />
      </TabsContent>
      
      <TabsContent value="identity-verifications">
        <IdentityVerificationList />
      </TabsContent>

      <TabsContent value="bio-approvals">
        <BioApprovalList />
      </TabsContent>
      
      <TabsContent value="debug">
        <DebugInfoCard />
      </TabsContent>
    </Tabs>
  );
}
