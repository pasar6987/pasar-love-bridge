
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/i18n/useLanguage";
import { IdentityVerificationList } from "./IdentityVerificationList";
import { ProfileVerificationList } from "./ProfileVerificationList";
import { VerificationRequest } from "./IdentityVerificationList";

interface AdminTabsProps {
  identityRequests: VerificationRequest[];
  photoRequests: VerificationRequest[];
  loading: boolean;
  onRefresh: () => void;
}

export const AdminTabs = ({ identityRequests, photoRequests, loading, onRefresh }: AdminTabsProps) => {
  const { t } = useLanguage();
  
  return (
    <Tabs defaultValue="identity">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="identity">{t("admin.identity_verification")}</TabsTrigger>
        <TabsTrigger value="profile">{t("admin.profile_photo")}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="identity">
        <IdentityVerificationList 
          identityRequests={identityRequests} 
          loading={loading} 
          onRefresh={onRefresh} 
        />
      </TabsContent>
      
      <TabsContent value="profile">
        <ProfileVerificationList 
          photoRequests={photoRequests} 
          loading={loading} 
          onRefresh={onRefresh} 
        />
      </TabsContent>
    </Tabs>
  );
};
