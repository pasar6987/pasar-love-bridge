
import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/useLanguage";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  id: string;
  name: string;
  age: number;
  location: string;
  photo: string;
  bio: string;
  job: string;
  nationality?: string;
}

interface ProfileGridProps {
  profiles: ProfileData[];
  onLike: (id: string) => void;
}

export function ProfileGrid({ profiles, onLike }: ProfileGridProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [likingProfiles, setLikingProfiles] = useState<Record<string, boolean>>({});
  
  const handleLike = (id: string) => {
    setLikingProfiles(prev => ({ ...prev, [id]: true }));
    
    setTimeout(() => {
      onLike(id);
      setLikingProfiles(prev => ({ ...prev, [id]: false }));
      
      toast({
        title: t("matches.likeSent"),
        description: t("matches.likeDescription"),
      });
    }, 500);
  };
  
  if (profiles.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t("home.noMatches")}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {profiles.map((profile) => (
        <Card key={profile.id} className="overflow-hidden shadow hover:shadow-md transition-shadow">
          <Link to={`/profile/${profile.id}`} className="block">
            <div className="h-48 overflow-hidden">
              <img
                src={profile.photo}
                alt={profile.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </div>
          </Link>
          
          <div className="p-4">
            <div className="flex justify-between items-start mb-2">
              <Link to={`/profile/${profile.id}`} className="hover:underline">
                <h3 className="font-semibold text-lg">{profile.name}, {profile.age}</h3>
                <p className="text-sm text-muted-foreground">{profile.location}</p>
              </Link>
              
              <Button
                onClick={() => handleLike(profile.id)}
                className="rounded-full h-10 w-10 bg-white hover:bg-gray-100 text-primary border border-gray-200"
                size="icon"
                disabled={likingProfiles[profile.id]}
              >
                {likingProfiles[profile.id] ? (
                  <span className="h-4 w-4 animate-ping rounded-full bg-primary/30"></span>
                ) : (
                  <Heart className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            <p className="text-sm text-gray-600 line-clamp-2 h-10">{profile.bio}</p>
            
            <p className="text-xs text-muted-foreground mt-2">{profile.job}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
