import { Monitor, Moon, Sun } from "lucide-react";
import {
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/theme-provider";

interface ThemeSubMenuProps {
  inline?: boolean;
}

export function ThemeSubMenu({ inline = false }: ThemeSubMenuProps) {
  const {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    darkAccentColor,
    setDarkAccentColor,
  } = useTheme();

  const content = (
    <>
      {/* Світла тема */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Sun />
          Світла
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup
            value={accentColor}
            onValueChange={(value) => {
              if (value === "orange" || value === "rose") {
                setAccentColor(value);
                setTheme("light");
              }
            }}
          >
            <DropdownMenuRadioItem value="orange">Orange</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="rose">Rose</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSeparator />

      {/* Темна тема */}
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          <Moon />
          Темна
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          <DropdownMenuRadioGroup
            value={darkAccentColor}
            onValueChange={(value) => {
              if (value === "teal" || value === "violet" || value === "rose") {
                setDarkAccentColor(value);
                setTheme("dark");
              }
            }}
          >
            <DropdownMenuRadioItem value="teal">Teal</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="violet">Violet</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="rose">Rose</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuSubContent>
      </DropdownMenuSub>

      <DropdownMenuSeparator />

      {/* Системна тема */}
      <DropdownMenuRadioGroup
        value={theme === "system" ? "system" : ""}
        onValueChange={(value) => {
          if (value === "system") {
            setTheme("system");
          }
        }}
      >
        <DropdownMenuRadioItem value="system">Системна</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
    </>
  );


  // Якщо inline=true — виводимо пункти одразу (для кнопки-сонечка у футері)
  if (inline) {
    return content;
  }

  // Для основного меню в хедері залишаємо обгортку "Тема >"
  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger>
        {theme === "dark" ? <Moon /> : theme === "system" ? <Monitor /> : <Sun />}
        Тема
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>{content}</DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}