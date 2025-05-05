import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/i18n/useLanguage";
import { Link } from "react-router-dom";

interface ProfileData {
  id: string;
  name: string;
  age: number;
  location: string;
  photo: string;
  bio: string;
  job: string;
}

interface RecommendationCardProps {
  profile: ProfileData;
  onLike: (id: string) => void;
  onPass: (id: string) => void;
}

export function RecommendationCard({ profile, onLike, onPass }: RecommendationCardProps) {
  const { t, language } = useLanguage();
  
  return (
    <div className="pasar-card overflow-hidden max-w-lg w-full mx-auto h-[70vh] md:h-[500px] flex flex-col">
      <div className="relative w-full h-4/6 overflow-hidden rounded-t-xl">
        <img
          src={profile.photo}
          alt={profile.name}
          className="w-full h-full object-cover"
        />
        <Link 
          to={`/profile/${profile.id}`}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 text-white"
        >
          <h3 className="text-xl font-semibold">
            {profile.name}, {profile.age}
          </h3>
          <p className="text-sm opacity-90">{profile.location}</p>
        </Link>
      </div>
      
      <div className="flex-grow flex flex-col justify-between p-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{profile.job}</p>
          <p className="text-sm line-clamp-3">{profile.bio}</p>
        </div>
        
        <div className="flex justify-center space-x-4 mt-4">
          <Button
            onClick={() => onPass(profile.id)}
            className="rounded-full h-14 w-14 bg-gray-100 hover:bg-gray-200 text-gray-500"
            size="icon"
          >
            <X className="h-6 w-6" />
          </Button>
          <Button
            onClick={() => onLike(profile.id)}
            className="rounded-full h-14 w-14 bg-primary hover:bg-primary/90 text-primary-foreground"
            size="icon"
          >
            <Heart className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
