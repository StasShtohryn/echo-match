import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Settings, MessageCircle, Heart, HeartHandshake, BadgeCheck } from "lucide-react";
import { useNavigate, Navigate } from "react-router";
import { useAuthStore } from "@/store/useAuthStore"

export default function ProfilePage() {
  const { user, logout } = useAuthStore()

  const navigate = useNavigate()

  if (!user) {
     return <Navigate to="/login" replace />;
  }

  const displayName = user.name ?? user.email.split("@")[0];

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-350">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Особистий Кабінет</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Edit className="mr-2 size-4" />
            Редагувати
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="mr-2 size-4" />
            Налаштування
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="p-0">
            <CardContent className="p-6">
              <div className="flex flex-col items-center">
                <Avatar className="size-20">
                  <AvatarImage
                    src={user.picture ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex mt-4 items-center gap-1.5">
                  <h2 className="text-lg font-semibold">{displayName}</h2>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-primary hover:opacity-80 transition-opacity">
                        <BadgeCheck className="size-5" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-60">
                      <p>Користувач пройшов верифікацію за допомогою сервісу AWS Amazon Rekognition</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <p className="text-muted-foreground text-sm">
                  {user.provider === "google" ? "Google user" : "Користувач"}
                </p>


              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Дата реєстрації</span>
                  <span>Січ 2024</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Активність</span>
                  <span>2 год. тому</span>
                </div>
              </div>
              <Button className="mt-4 w-full" size="lg" onClick={() => { logout(); navigate("/login") } }>
                Вийти
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="space-y-4 md:col-span-3">
          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <Heart className="text-primary size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">128</p>
                    <p className="text-muted-foreground text-sm">
                      Метчів
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <MessageCircle className="text-primary size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">8.5k</p>
                    <p className="text-muted-foreground text-sm">
                      Повідомлень
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="p-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 rounded-lg p-2">
                    <HeartHandshake className="text-primary size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold">79%</p>
                    <p className="text-muted-foreground text-sm">
                      Взаємність
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="p-0">
            <CardContent className="p-6">
              <h3 className="mb-4 text-lg font-semibold">Остання активність</h3>
              <div className="space-y-4">
                <div
                  className="flex items-start gap-4 border-b pb-4 last:border-0"
                >
                  <div className="bg-muted rounded-full p-2">
                    <Heart className="text-muted-foreground size-4" />
                  </div>
                  <div>
                    <p className="text-sm">
                      Ви сподобались дівчині Марія
                    </p>
                    <p className="text-muted-foreground text-xs">
                      2 години тому
                    </p>
                  </div>
                </div>
                <div
                  className="flex items-start gap-4 border-b pb-4 last:border-0"
                >
                  <div className="bg-muted rounded-full p-2">
                    <Heart className="text-muted-foreground size-4" />
                  </div>
                  <div>
                    <p className="text-sm">
                      Ви сподобались дівчині Марія
                    </p>
                    <p className="text-muted-foreground text-xs">
                      2 години тому
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
