import { Heart, Sun } from "lucide-react";
import { Link } from "react-router";
import { ModeToggle } from "./mode-toggle";
import { useState, useEffect } from "react";
import { useTheme } from "./theme-provider";
import logo from "@/media/logo.svg";
import logoDark from "@/media/logo_dark.svg";

const links = [
  {
    title: "Про нас",
    to: "/about",
  },
  {
    title: "Контакти",
    to: "/contacts",
  },
  {
    title: "Privacy Policy",
    to: "/privacy",
  },
];

const Footer = () => {

  const { theme } = useTheme();

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    if (theme === "dark") return true;
    if (theme === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // 🌟 Синхронізуємо стан логотипа при зміні теми
  useEffect(() => {
    if (theme === "dark") {
      setIsDarkMode(true);
    } else if (theme === "light") {
      setIsDarkMode(false);
    } else {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      setIsDarkMode(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);

  return (
    <footer className="border-t bg-background px-6 py-2">
      <div className="mx-auto w-full max-w-screen-2xl divide-y">
        <div className="flex flex-col items-center justify-between gap-4 px-2 pt-3 pb-5 sm:flex-row">
          <Link to="/" className="flex items-center gap-2 text-[16px] font-medium">
            <div className="flex">
              <img
                src={isDarkMode ? logoDark : logo}
                alt="EchoMatch Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
          </Link>

          <p className="text-center text-sm font-medium text-muted-foreground">
            Знайомства для тих, хто шукає справжнє
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-medium text-sm">
            {links.map(({ title, to }) => (
              <li key={title}>
                <Link to={to}>{title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col-reverse items-center justify-between gap-4 px-2 pt-4 pb-2 sm:flex-row">
          <p className="font-medium text-muted-foreground text-sm">
            Copyright &copy; {new Date().getFullYear()} EchoMatch. All rights reserved.
          </p>

          <div className="flex items-center gap-4">
            <ModeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;