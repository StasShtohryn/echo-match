import { BellIcon, Heart, LogOutIcon, Monitor, Moon, Settings, Sun, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/components/theme-provider"
import { getMyProfile, type MyProfile } from "@/services/auth-service";

import logo from "@/media/logo.svg"
import logoDark from "@/media/logo_dark.svg"
import { useEffect, useState } from "react";


export default function Header() {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme()

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    if (theme === "dark") return true;
    if (theme === "light") return false;

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const updateDarkMode = () => {
      const shouldUseDarkMode =
        theme === "dark" ||
        (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

      setIsDarkMode(shouldUseDarkMode);
    };

    updateDarkMode();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => updateDarkMode();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;
    async function loadUserData() {
      try {
        const data = await getMyProfile();
        if (isMounted && data) {
          setProfile(data);
        }
      } catch (error) {
        console.error("Не вдалося завантажити профіль у хедері:", error);
      }
    }

    if (user) {
      void loadUserData();
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  const displayName = profile?.displayName ?? user?.name ?? "Користувач";
  const userAge = profile?.age;


  return (
    <header className="flex w-full shrink-0 flex-row items-center justify-between border-b border-border/80 dark:border-blue-100/30 bg-card/55 backdrop-blur-lg px-4 py-3 shadow-none">
      <Link to="/" className="flex items-center gap-2 text-[16px] font-medium">
        <div className="flex">
          <img
            src={isDarkMode ? logoDark : logo}
            alt="EchoMatch Logo"
            className="h-10 w-auto object-contain"
          />
        </div>
      </Link>

      <Link to="/messenger">
        <Button variant="link" className="cursor-pointer">
          Події
        </Button>
      </Link>
      <Link to="/messenger">
        <Button variant="link" className="cursor-pointer">
          Месенджер
        </Button>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          nativeButton={false}
          render={
            <div className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-85">
              <span className="text-sm font-bold">
                {displayName}
                {userAge !== undefined && `, ${userAge}`}
              </span>

              <Avatar className="size-10 border border-[#F3DDD0]">
                <AvatarImage
                  src={profile?.photos?.[0]?.url ?? user?.picture ?? undefined}
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-[#FAF7F2] font-bold text-[#F37936]">
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>

          }
        />
        <DropdownMenuContent align="center" className="min-w-max">
          <DropdownMenuGroup>
            <Link to="/notifications">
              <DropdownMenuItem className="cursor-pointer">
                <BellIcon />
                Сповіщення
              </DropdownMenuItem>
            </Link>
            <Link to="/me">
              <DropdownMenuItem className="cursor-pointer">
                <User />
                Профіль
              </DropdownMenuItem>
            </Link>
            <Link to="/me/edit">
              <DropdownMenuItem className="cursor-pointer">
                <Settings />
                Налаштування
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              {theme === "dark" ? <Moon /> : theme === "system" ? <Monitor /> : <Sun />}
              Тема
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup
                value={theme}
                onValueChange={(value) => setTheme(value as typeof theme)}
              >
                <DropdownMenuRadioItem value="light">Світла</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Темна</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">Системна</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
            <LogOutIcon />
            Вийти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
