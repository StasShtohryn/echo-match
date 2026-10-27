import { BellIcon, LogOutIcon, Settings, User } from "lucide-react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";
import { useTheme } from "@/components/theme-provider"
import { getMyProfile, type MyProfile } from "@/services/auth-service";

import logo from "@/media/logo.svg"
import logoDark from "@/media/logo_dark.svg"
import { useEffect, useState } from "react";
import { ThemeSubMenu } from "@/components/theme-menu";

export default function Header() {
  const { user, logout } = useAuthStore();
  const { theme } = useTheme();

  const [profile, setProfile] = useState<MyProfile | null>(null);
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;

    if (theme === "dark") return true;
    if (theme === "light") return false;

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const isTestPage = location.pathname.includes("/test") || location.pathname.includes("/onboarding");

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
  const mainPhoto = profile?.photos.find((photo) => photo.isMain) ?? profile?.photos[0];

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <header className="sticky top-0 z-40 flex w-full shrink-0 flex-row items-center justify-between border-b border-border/80 bg-card/90 px-4 py-2.5 sm:py-3 shadow-none backdrop-blur-lg dark:border-blue-100/30 dark:bg-card/80">
      <Link to="/" className="flex items-center gap-2 text-[16px] font-medium">
        <div className="flex">
          <img
            src={isDarkMode ? logoDark : logo}
            alt="EchoMatch Logo"
            className="h-8 md:h-10 w-auto object-contain"
          />
        </div>
      </Link>

      {!isTestPage && (
        <nav className="hidden md:flex justify-between gap-8 lg:gap-10">
          <Link to="/">
            <Button
              variant="link"
              className={`cursor-pointer px-1 text-sm font-medium hover:no-underline transition-colors ${
                isActive("/")
                  ? "text-primary font-semibold"
                  : "text-[#53535A] hover:text-foreground dark:text-[#CCCCCC]"
              }`}
            >
              Свайпи
            </Button>
          </Link>
          <Link to="/events">
            <Button
              variant="link"
              className={`cursor-pointer px-1 text-sm font-medium hover:no-underline transition-colors ${
                isActive("/events")
                  ? "text-primary font-semibold"
                  : "text-[#53535A] hover:text-foreground dark:text-[#CCCCCC]"
              }`}
            >
              Події
            </Button>
          </Link>
          <Link to="/messenger">
            <Button
              variant="link"
              className={`cursor-pointer px-1 text-sm font-medium hover:no-underline transition-colors ${
                isActive("/messenger")
                  ? "text-primary font-semibold"
                  : "text-[#53535A] hover:text-foreground dark:text-[#CCCCCC]"
              }`}
            >
              Чати
            </Button>
          </Link>
          <Link to="/me">
            <Button
              variant="link"
              className={`cursor-pointer px-1 text-sm font-medium hover:no-underline transition-colors ${
                isActive("/me")
                  ? "text-primary font-semibold"
                  : "text-[#53535A] hover:text-foreground dark:text-[#CCCCCC]"
              }`}
            >
              Профіль
            </Button>
          </Link>
        </nav>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger
          nativeButton={false}
          render={
            <div className="flex cursor-pointer items-center gap-3 transition-opacity hover:opacity-85">
              <span className="hidden md:inline text-sm font-bold">
                {displayName}
                {userAge !== undefined && `, ${userAge}`}
              </span>

              <Avatar
                className="size-9 sm:size-10 border"
                style={{ borderColor: "var(--header-accent-border)" }}
              >
                <AvatarImage
                  src={mainPhoto?.url ?? user?.picture ?? undefined}
                  alt={displayName}
                  className="object-cover"
                />
                <AvatarFallback
                  className="bg-[#FAF7F2] font-bold"
                  style={{ color: "var(--header-accent)" }}
                >
                  {displayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          }
        />
        <DropdownMenuContent align="end" className="min-w-max">
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
            <Link to="/settings">
              <DropdownMenuItem className="cursor-pointer">
                <Settings />
                Налаштування
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <ThemeSubMenu />
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
