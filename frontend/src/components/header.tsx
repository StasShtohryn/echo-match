import { BellIcon, Heart, LogOutIcon, Settings, User } from "lucide-react";
import { Card } from "./ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Link } from "react-router";
import { useAuthStore } from "@/store/useAuthStore";

export default function Header() {
  const { user, logout } = useAuthStore()

  return (
    <Card className="m-4 flex w-[calc(100%-2rem)] shrink-0 flex-row justify-between self-center p-3 max-w-180">
      <Link to="/" className="flex items-center text-[16px] gap-2 font-medium">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Heart className="size-4" />
        </div>
        EchoMatch
      </Link>

      <Link to={"/messenger"}>
        <Button variant={"link"} className="cursor-pointer">
          Месенджер
        </Button>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="rounded-full"><Avatar className="w-10 h-10 cursor-pointer">
          <AvatarImage src={user?.picture ?? undefined} alt={user?.name ?? user?.email ?? "User"} />
          <AvatarFallback>{(user?.name ?? user?.email ?? "ME").slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar></Button>} />
        <DropdownMenuContent align="center" className="min-w-max">
          <DropdownMenuGroup>
            <Link to={"/notifications"} >
              <DropdownMenuItem className="cursor-pointer">
                <BellIcon />
                Сповіщення
              </DropdownMenuItem>
            </Link>
            <Link to={"/me"}>
              <DropdownMenuItem className="cursor-pointer">
                <User />
                Профіль
              </DropdownMenuItem>
            </Link>
            <Link to={"/"} >
              <DropdownMenuItem className="cursor-pointer">
                <Settings />
                Налаштування
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
            <LogOutIcon />
            Вийти
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </Card>
  )
}
