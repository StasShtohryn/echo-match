import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sun, Moon } from "lucide-react";
import { ThemeSubMenu } from "./theme-menu";
import { useTheme } from "./theme-provider";

export function ModeToggle() {
  const { theme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button variant="ghost" size="icon" className="cursor-pointer">
          <Sun className="h-[5rem] w-[5rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[5rem] w-[5rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Перемикач теми</span>
        </Button>
      } />
      <DropdownMenuContent align="end">
        <ThemeSubMenu inline />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}