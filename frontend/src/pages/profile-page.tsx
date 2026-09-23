import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Settings, MessageCircle, Heart, HeartHandshake, BadgeCheck } from "lucide-react";
import { useNavigate, Navigate } from "react-router";
import { useAuthStore } from "@/store/useAuthStore"
import { useEffect, useState } from "react";
import { getMyProfile, type MyProfile } from "@/services/auth-service";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "@/components/ui/toast";

export default function ProfilePage() {
  const { user, login, logout } = useAuthStore()
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      return
    }

    const currentUser = user
    let isMounted = true

    async function loadProfile() {
      try {
        const result = await getMyProfile()
        if (isMounted) {
          setProfile(result)

          const mainPhoto = result.photos.find((photo) => photo.isMain) ?? result.photos[0]
          if (mainPhoto && mainPhoto.url !== currentUser.picture) {
            login({
              userId: currentUser.id,
              email: currentUser.email,
              accessToken: currentUser.token,
              name: result.displayName,
              picture: mainPhoto.url,
              provider: currentUser.provider,
            })
          }
        }
      } catch (error: unknown) {
        const isMissingProfile =
          error && typeof error === "object" && "response" in error &&
          error.response && typeof error.response === "object" &&
          "status" in error.response && error.response.status === 404

        if (isMounted && isMissingProfile) {
          navigate("/register?onboarding=1", { replace: true })
        } else if (isMounted) {
          toast.add({
            type: "error",
            title: "Не вдалося завантажити профіль",
            description: getApiErrorMessage(error, "Спробуйте ще раз."),
          })
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      isMounted = false
    }
    }, [login, navigate, user])

    if (!user) {
      return <Navigate to="/login" replace />;
    }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-6">Завантаження профілю...</div>
  }

  if (!profile) {
    return <div className="container mx-auto px-4 py-6">Профіль недоступний.</div>
  }

  const displayName = profile?.displayName ?? user.name ?? user.email.split("@")[0];

  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const mainPhoto = profile?.photos.find((photo) => photo.isMain) ?? profile?.photos[0]
  const profilePicture = mainPhoto?.url ?? user.picture

  console.log(profile?.createdAt);
  

  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col">
      <ScrollArea className="h-full min-h-0 flex-1">
      <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-350">
      <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row">
        <h1 className="text-2xl font-semibold">Особистий Кабінет</h1>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/me/edit")}>
            <Edit className="mr-2 size-4" />
            Редагувати
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/settings")}>
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
                    src={profilePicture ?? undefined}
                    alt={displayName}
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex mt-4 items-center gap-1.5">
                  <h2 className="text-lg font-semibold">{displayName}</h2>
                  {profile?.isFaceVerified ? 
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
                  : ""}
                </div>
                <p className="text-muted-foreground text-sm">
                  {user.provider === "google" ? "Google user" : "Користувач"}
                </p>


              </div>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Дата реєстрації</span>
                  <span>{profile?.createdAt ? "Профіль заповнено" : "Не вказано"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Активність</span>
                  <span>{profile?.isFaceVerified ? "Верифіковано" : "Не верифіковано"}</span>
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

          <ProfileDetails profile={profile} />

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
      </ScrollArea>
    </div>
  );
}

function ProfileDetails({ profile }: { profile: MyProfile }) {
  const details = [
    ["Стать", profile.gender],
    ["Вік", profile.age ? `${profile.age} років` : null],
    ["Знак зодіаку", profile.zodiac],
    ["Орієнтація", profile.orientation],
    ["Шукає", profile.lookingFor],
    ["Зріст", profile.heightCm ? `${profile.heightCm} см` : null],
    ["Заняття", profile.occupation],
    ["Компанія", profile.company],
    ["Освіта", profile.school],
    ["Сімейні плани", profile.familyPlans],
    ["Спілкування", profile.communication],
    ["Мова кохання", profile.loveLanguage],
    ["Домашні тварини", profile.pets],
    ["Алкоголь", profile.drinking],
    ["Куріння", profile.smoking],
    ["Спорт", profile.workout],
  ] as const

  return <div className="space-y-4">
    <Card>
      <CardContent className="space-y-5 p-6">
        <div>
          <h3 className="text-lg font-semibold">Про себе</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{profile.bio || "Розкажіть про себе, щоб іншим було легше познайомитися з вами."}</p>
        </div>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {details.filter(([, value]) => value).map(([label, value]) => <div className="flex justify-between gap-4 border-b border-border/60 pb-2 text-sm" key={label}><span className="text-muted-foreground">{label}</span><span className="text-right">{value}</span></div>)}
        </div>
        <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2">
          <div><p className="mb-2 text-sm text-muted-foreground">Instagram</p><p className="text-sm">{profile.instagramHandle ? `@${profile.instagramHandle}` : "Не вказано"}</p></div>
          <div><p className="mb-2 text-sm text-muted-foreground">Spotify</p><p className="text-sm">{profile.spotifyHandle || "Не вказано"}</p></div>
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardContent className="p-6"><h3 className="mb-3 text-lg font-semibold">Інтереси</h3><div className="flex flex-wrap gap-2">{profile.interests.length ? profile.interests.map((item) => <Badge variant="secondary" key={item.id}>{item.name}</Badge>) : <p className="text-sm text-muted-foreground">Ще не додано</p>}</div></CardContent></Card>
      <Card><CardContent className="p-6"><h3 className="mb-3 text-lg font-semibold">Мови</h3><div className="flex flex-wrap gap-2">{profile.languages.length ? profile.languages.map((item) => <Badge variant="secondary" key={item.id}>{item.name}</Badge>) : <p className="text-sm text-muted-foreground">Ще не додано</p>}</div></CardContent></Card>
    </div>

    <Card><CardContent className="space-y-4 p-6"><h3 className="text-lg font-semibold">Мої відповіді</h3>{profile.promptAnswers.length ? profile.promptAnswers.map((answer) => <div className="border-b border-border/60 pb-3 last:border-0 last:pb-0" key={answer.promptId}><p className="text-sm text-muted-foreground">{answer.question}</p><p className="mt-1 text-sm">{answer.answer}</p></div>) : <p className="text-sm text-muted-foreground">Відповідей ще немає</p>}</CardContent></Card>

    <Card><CardContent className="space-y-4 p-6"><div className="flex items-center justify-between gap-3"><h3 className="text-lg font-semibold">Мої налаштування</h3><Badge variant={profile.isPrivate ? "secondary" : "outline"}>{profile.isPrivate ? "Приватний профіль" : "Відкритий профіль"}</Badge></div>{profile.preferences ? <div className="grid gap-4 text-sm sm:grid-cols-3"><div><p className="text-muted-foreground">Показувати</p><p className="mt-1">{profile.preferences.showMe}</p></div><div><p className="text-muted-foreground">Вік</p><p className="mt-1">{profile.preferences.minAge}–{profile.preferences.maxAge}</p></div><div><p className="text-muted-foreground">Відстань</p><p className="mt-1">{profile.preferences.maxDistanceKm ? `${profile.preferences.maxDistanceKm} км` : "Без обмежень"}</p></div></div> : <p className="text-sm text-muted-foreground">Налаштування пошуку ще не збережені.</p>}</CardContent></Card>

    {profile.photos.length > 0 && <Card><CardContent className="p-6"><h3 className="mb-4 text-lg font-semibold">Фотографії</h3><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{profile.photos.map((photo) => <img className="aspect-square w-full rounded-2xl object-cover" src={photo.url} alt="Фото профілю" key={photo.id} />)}</div></CardContent></Card>}
  </div>
}
