
import { Heart, Bell, User } from "lucide-react";
import { useLanguage } from "@/i18n/useLanguage";
import { Link } from "react-router-dom";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function Header() {
  const { language, t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to={`/${language}`} className="flex items-center">
            <Heart className="h-6 w-6 text-pastel-pink mr-2" />
            <span className="text-xl font-bold font-hand">
              {t('app.name')}
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8 items-center">
            <Link to={`/${language}/home`} className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            <Link to={`/${language}/matches`} className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.matches')}
            </Link>
            <Link to={`/${language}/chat`} className="text-gray-700 hover:text-primary transition-colors">
              {t('nav.chat')}
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <LanguageToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-full"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-white"></span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 mt-2">
                <div className="px-4 py-3 font-medium border-b">
                  {t('settings.notifications')}
                </div>
                <DropdownMenuItem className="py-2 px-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">
                      {language === "ko" ? "새로운 매치가 있습니다" : "新しいマッチがあります"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ko" ? "5분 전" : "5分前"}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="py-2 px-4 cursor-pointer">
                  <div>
                    <p className="text-sm font-medium">
                      {language === "ko" ? "Ayumi님이 메시지를 보냈습니다" : "Ayumiさんがメッセージを送信しました"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ko" ? "1시간 전" : "1時間前"}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="justify-center cursor-pointer">
                  <Link to={`/${language}/notifications`} className="text-sm text-primary">
                    {language === "ko" ? "모든 알림 보기" : "すべての通知を見る"}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link to={`/${language}/profile`}>
              <div className="h-10 w-10 rounded-full bg-pastel-lavender flex items-center justify-center">
                <User className="h-5 w-5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
