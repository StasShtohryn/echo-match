import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit, Settings, MessageCircle, Heart, HeartHandshake, BadgeCheck } from "lucide-react";
import { useNavigate, Navigate } from "react-router";
import { useAuthStore } from "@/store/useAuthStore"
import { useEffect, useRef, useState } from "react";
import { getMyProfile, uploadProfilePhoto, type MyProfile } from "@/services/auth-service";
import { getMatchCounts } from "@/services/match-service";
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "@/components/ui/toast";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction } from "@/components/ui/attachment";

import { Dialog } from "@base-ui/react/dialog";
import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { X } from "lucide-react";
import {
  getLabel,
  ORIENTATION_OPTIONS,
  LOVE_STYLE_OPTIONS,
  GOAL_OPTIONS,
  FAMILY_PLAN_OPTIONS,
  PET_OPTIONS,
  WORKOUT_OPTIONS,
  DRINKING_OPTIONS,
  SMOKING_OPTIONS,
  COMMUNICATION_OPTIONS,
  ZODIAC_OPTIONS,
  INTERESTED_IN_OPTIONS,
} from "@/lib/some-lookups";



export default function ProfilePage() {
  const { user, login, logout } = useAuthStore()
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [matchCount, setMatchCount] = useState<number | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState(0);
  const [lightboxCarouselApi, setLightboxCarouselApi] = useState<CarouselApi | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState<{ fileName: string; progress: number } | null>(null)


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

  useEffect(() => {
    if (!lightboxCarouselApi || lightboxIndex === null) return;
    const carouselApi = lightboxCarouselApi;

    function handleLightboxSelect() {
      setLightboxCurrentIndex(carouselApi.selectedScrollSnap());
    }

    handleLightboxSelect();
    carouselApi.on("select", handleLightboxSelect);
    return () => {
      carouselApi.off("select", handleLightboxSelect);
    };
  }, [lightboxCarouselApi, lightboxIndex]);

  const photoUploadController = useRef<AbortController | null>(null)
  async function handlePhoto(file: File) {
    const controller = new AbortController()
    photoUploadController.current = controller
    setUploadingPhoto({ fileName: file.name, progress: 0 })

    try {
      await uploadProfilePhoto(file, {
        signal: controller.signal,
        onProgress: (progress) => setUploadingPhoto({ fileName: file.name, progress }),
      })
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Фото додано" })
    } catch (error: unknown) {
      if (controller.signal.aborted) return
      toast.add({ type: "error", title: "Не вдалося додати фото", description: getApiErrorMessage(error, "Перевірте формат і розмір файлу.") })
    } finally {
      if (photoUploadController.current === controller) {
        photoUploadController.current = null
        setUploadingPhoto(null)
      }
    }
  }

  function cancelPhotoUpload() {
    photoUploadController.current?.abort()
  }


  useEffect(() => {
    if (!user) {
      return
    }

    let isMounted = true

    async function loadMatchCount() {
      try {
        const counts = await getMatchCounts()
        if (isMounted) {
          setMatchCount(counts.total)
        }
      } catch (error: unknown) {
        if (isMounted) {
          toast.add({
            type: "error",
            title: "Не вдалося завантажити кількість матчів",
            description: getApiErrorMessage(error, "Спробуйте ще раз."),
          })
        }
      }
    }

    void loadMatchCount()

    return () => {
      isMounted = false
    }
  }, [user])

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

  const photos = profile?.photos ? [...profile.photos].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
    return a.order - b.order;
  }) : [];
  const count = photos.length;


  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col ">
      <ScrollArea className="h-full min-h-0 flex-1">
        <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-350">
          <div className="mb-6 flex flex-col items-start justify-between gap-2 sm:flex-row">
            <h1 className="text-2xl font-semibold">Особистий Кабінет</h1>
            <div className="flex gap-2">
              <Button variant="default" size="sm" onClick={() => navigate("/me/edit")}>
                <Edit className="mr-2 size-4" />
                Редагувати
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate("/settings")}>
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

                  <div className="mt-6 space-y-3 border-t border-border/50 pt-4 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground font-medium">Дата реєстрації</span>
                      <span className="font-medium text-foreground">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground font-medium">Верифікація</span>
                      {profile?.isFaceVerified ? (
                        <div className="flex items-center gap-1.5">
                          <Badge variant="secondary" className="gap-1 text-xs text-primary">
                            <BadgeCheck className="size-3.5" />
                            Верифіковано
                          </Badge>
                          {profile.photos.some((photo) => !photo.isFaceVerified) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-1.5 text-[11px] text-muted-foreground hover:text-foreground"
                              onClick={() => navigate("/verification")}
                            >
                              + Нові фото
                            </Button>
                          )}
                        </div>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 px-2.5 text-xs font-medium border-primary/40 text-primary hover:bg-primary/10"
                          onClick={() => navigate("/verification")}
                        >
                          Пройти
                        </Button>
                      )}
                    </div>
                  </div>
                  <Button className="mt-4 w-full" size="lg" onClick={() => { logout(); navigate("/login") }}>
                    Вийти
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-4 p-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center pb-3">
                    <h3 className="text-lg font-semibold">Фотографії</h3>
                  </div>
                  <label
                    className="flex w-full cursor-pointer items-center justify-center gap-2 mb-4  rounded-xl border border-dashed border-primary/40 bg-primary/5 py-2 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                    aria-label="Додати фото"
                  >
                    <ImagePlus className="size-4" />
                    <span>Додати нове фото</span>
                    <input
                      className="hidden"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                      disabled={!!uploadingPhoto}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        if (file) void handlePhoto(file);
                      }}
                    />
                  </label>

                  {/* ВАРІАНТ 1: Лише 1 фото */}
                  {count === 1 && (
                    <div className="grid grid-cols-1 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxCurrentIndex(0);
                          setLightboxIndex(0);
                        }} className="aspect-[4/5] relative overflow-hidden rounded-2xl">
                        <img src={photos[0].url} alt="Main photo" className="size-full object-cover" />
                        {photos[0].isFaceVerified && (
                          <span className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-primary shadow-xs backdrop-blur-xs" title="Обличчя верифіковано">
                            <BadgeCheck className="size-4" />
                          </span>
                        )}
                      </button>
                    </div>
                  )}

                  {/* ВАРІАНТ 2: 2 фотографії */}
                  {count === 2 && (
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => {
                            setLightboxCurrentIndex(index);
                            setLightboxIndex(index);
                          }} className="aspect-square relative overflow-hidden rounded-2xl">
                          <img src={photo.url} alt="Photo" className="size-full object-cover" />
                          {photo.isFaceVerified && (
                            <span className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-primary shadow-xs backdrop-blur-xs" title="Обличчя верифіковано">
                              <BadgeCheck className="size-4" />
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* ВАРІАНТ 3: Від 3 до 6 фото */}
                  {count >= 3 && count < 7 && (
                    <div className="grid grid-cols-2 gap-3">
                      {photos.map((photo, index) => (
                        <button
                          key={photo.id}
                          type="button"
                          onClick={() => {
                            setLightboxCurrentIndex(index);
                            setLightboxIndex(index);
                          }} className="aspect-square relative overflow-hidden rounded-2xl">
                          <img src={photo.url} alt="Photo" className="size-full object-cover" />
                          {photo.isFaceVerified && (
                            <span className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-primary shadow-xs backdrop-blur-xs" title="Обличчя верифіковано">
                              <BadgeCheck className="size-4" />
                            </span>
                          )}
                        </button>
                      ))}
                      {uploadingPhoto && (
                        <div className="mt-3">
                          <Attachment state="uploading" className="w-full">
                            <AttachmentMedia>
                              <LoaderCircle className="animate-spin" />
                            </AttachmentMedia>
                            <AttachmentContent>
                              <AttachmentTitle>{uploadingPhoto.fileName}</AttachmentTitle>
                              <AttachmentDescription>
                                Завантаження · {uploadingPhoto.progress}%
                              </AttachmentDescription>
                            </AttachmentContent>
                            <AttachmentActions>
                              <AttachmentAction
                                type="button"
                                aria-label="Скасувати завантаження"
                                onClick={cancelPhotoUpload}
                              >
                                <X />
                              </AttachmentAction>
                            </AttachmentActions>
                          </Attachment>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ВАРІАНТ 4: 6+ фото (Макет з фігми) */}
                  {count >= 7 && (
                    <div className="grid grid-cols-2 gap-3">
                      {/* Перші 3 великі фото */}
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxCurrentIndex(0);
                          setLightboxIndex(0);
                        }}
                        className="aspect-square relative overflow-hidden rounded-2xl"
                      >
                        <img src={photos[0].url} alt="Photo 1" className="size-full object-cover" />
                        {photos[0].isFaceVerified && (
                          <span className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-primary shadow-xs backdrop-blur-xs" title="Обличчя верифіковано">
                            <BadgeCheck className="size-4" />
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxCurrentIndex(1);
                          setLightboxIndex(1);
                        }}
                        className="aspect-square relative overflow-hidden rounded-2xl"
                      >
                        <img src={photos[1].url} alt="Photo 2" className="size-full object-cover" />
                        {photos[1].isFaceVerified && (
                          <span className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-primary shadow-xs backdrop-blur-xs" title="Обличчя верифіковано">
                            <BadgeCheck className="size-4" />
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLightboxCurrentIndex(2);
                          setLightboxIndex(2);
                        }}
                        className="aspect-square relative overflow-hidden rounded-2xl"
                      >
                        <img src={photos[2].url} alt="Photo 3" className="size-full object-cover" />
                        {photos[2].isFaceVerified && (
                          <span className="absolute top-2 right-2 rounded-full bg-background/80 p-1 text-primary shadow-xs backdrop-blur-xs" title="Обличчя верифіковано">
                            <BadgeCheck className="size-4" />
                          </span>
                        )}
                      </button>

                      {/* Блок 2х2 для решти фото */}
                      <div className="grid grid-cols-2 gap-2">
                        {photos.slice(3, 7).map((photo, index) => {
                          const actualIndex = index + 3;
                          return (
                            <button
                              key={photo.id}
                              type="button"
                              onClick={() => {
                                setLightboxCurrentIndex(actualIndex);
                                setLightboxIndex(actualIndex);
                              }}
                              className="aspect-square relative overflow-hidden rounded-xl"
                            >
                              <img src={photo.url} alt="Photo" className="size-full object-cover" />
                              {photo.isFaceVerified && (
                                <span className="absolute top-1.5 right-1.5 rounded-full bg-background/80 p-0.5 text-primary shadow-xs backdrop-blur-xs" title="Обличчя верифіковано">
                                  <BadgeCheck className="size-3.5" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="mt-4 p-0">
                <CardContent className="space-y-4 p-6">
                  {/* Заголовок та кнопка редагування */}
                  <div className="flex items-center justify-center">
                    <h3 className="text-lg font-semibold">Мої налаштування</h3>
                  </div>

                  {/* Статус приватності по центру */}
                  <div className="flex justify-between items-center gap-2">
                    <Badge variant={profile.isPrivate ? "secondary" : "outline"}>
                      {profile.isPrivate ? "Приватний профіль" : "Відкритий профіль"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-foreground"
                      aria-label="Редагувати налаштування"
                      onClick={() => navigate("/settings")}
                    >
                      <Edit className="size-4" />
                    </Button>
                  </div>

                  {profile.preferences ? (
                    <div className="space-y-3">
                      {/* Показувати */}
                      <div className="flex items-center justify-between border-b border-border/50 pb-2 text-sm">
                        <span className="font-medium text-muted-foreground">Показувати</span>
                        <span className="font-semibold text-foreground">{getLabel(INTERESTED_IN_OPTIONS, profile.preferences.showMe)}</span>
                      </div>
                      {/* Вік */}
                      <div className="flex items-center justify-between border-b border-border/50 pb-2 text-sm">
                        <span className="font-medium text-muted-foreground">Вік</span>
                        <span className="font-semibold text-foreground">
                          {profile.preferences.minAge}–{profile.preferences.maxAge} років
                        </span>
                      </div>

                      {/* Відстань */}
                      <div className="flex items-center justify-between border-b border-border/50 pb-2 text-sm">
                        <span className="font-medium text-muted-foreground">Відстань</span>
                        <span className="font-semibold text-foreground">
                          {profile.preferences.maxDistanceKm
                            ? `${profile.preferences.maxDistanceKm} км`
                            : "Без обмежень"}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm italic text-muted-foreground/60">
                      Налаштування пошуку ще не збережені.
                    </p>
                  )}
                </CardContent>              </Card>
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
                        <p className="text-2xl font-semibold">{matchCount ?? "—"}</p>
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

              {/* Recent Activity
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
              </Card> */}
            </div>
          </div>
        </div>
      </ScrollArea >

      {/* Модальне вікно перегляду фотографій (Lightbox) */}
      <Dialog.Root
        open={lightboxIndex !== null}
        onOpenChange={(open) => {
          if (!open) setLightboxIndex(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 text-white outline-none">
            <Dialog.Title className="sr-only">
              Перегляд фотографій профілю {displayName}
            </Dialog.Title>
            {lightboxIndex !== null && (
              <>
                {/* Кнопка закриття */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="absolute top-4 right-4 z-20 border border-white/25 bg-neutral-950/75 text-white shadow-lg hover:bg-neutral-800 hover:text-white"
                  aria-label="Закрити перегляд"
                  onClick={() => setLightboxIndex(null)}
                >
                  <X />
                </Button>

                {/* Карусель перегляду */}
                <Carousel
                  setApi={setLightboxCarouselApi}
                  opts={{
                    startIndex: lightboxIndex,
                    loop: photos.length > 1,
                  }}
                  className="w-full max-w-5xl"
                >
                  <CarouselContent className="ml-0">
                    {photos.map((photo, index) => (
                      <CarouselItem key={photo.id} className="pl-0">
                        <img
                          src={photo.url}
                          alt={`${displayName}, фото ${index + 1}`}
                          className="mx-auto h-[80vh] max-h-225 w-full object-contain"
                        />
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  {photos.length > 1 && (
                    <>
                      <CarouselPrevious className="left-2 size-11 rounded-full border border-white/25 bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm hover:bg-neutral-800 hover:text-white sm:left-4" />
                      <CarouselNext className="right-2 size-11 rounded-full border border-white/25 bg-neutral-950/75 text-white shadow-lg backdrop-blur-sm hover:bg-neutral-800 hover:text-white sm:right-4" />
                    </>
                  )}
                </Carousel>

                {/* Лічильник фото (наприклад: 2 / 5) */}
                <div
                  className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white bg-black/40 px-3 py-1 rounded-full backdrop-blur-xs"
                  aria-live="polite"
                >
                  {lightboxCurrentIndex + 1} / {photos.length}
                </div>
              </>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div >
  );
}

function ProfileDetails({ profile }: { profile: MyProfile }) {
  const details = [
    // 1) місто + вік
    { label: "Місто", value: profile.city },
    { label: "Вік", value: profile.age ? `${profile.age} років` : null },

    // 2) орієнтація + мова кохання
    { label: "Орієнтація", value: getLabel(ORIENTATION_OPTIONS, profile.orientation) },
    { label: "Мова кохання", value: getLabel(LOVE_STYLE_OPTIONS, profile.loveLanguage) },

    // 3) стиль спілкування + фільтри (шукає)
    { label: "Стиль спілкування", value: getLabel(COMMUNICATION_OPTIONS, profile.communication) },
    { label: "Шукає", value: getLabel(GOAL_OPTIONS, profile.lookingFor) },

    // 4) знак зодіаку + плани на сім'ю
    { label: "Знак зодіаку", value: getLabel(ZODIAC_OPTIONS, profile.zodiac) },
    { label: "Плани на сім'ю", value: getLabel(FAMILY_PLAN_OPTIONS, profile.familyPlans) },

    // 5) тварини + освіта
    { label: "Домашні тварини", value: getLabel(PET_OPTIONS, profile.pets) },
    { label: "Освіта", value: profile.school },

    // 6) Рід занять + компанія
    { label: "Рід занять", value: profile.occupation },
    { label: "Компанія", value: profile.company },

    // 7) спорт + зріст
    { label: "Спорт", value: getLabel(WORKOUT_OPTIONS, profile.workout) },
    { label: "Зріст", value: profile.heightCm ? `${profile.heightCm} см` : null },

    // 8) алкоголь + куріння
    { label: "Алкоголь", value: getLabel(DRINKING_OPTIONS, profile.drinking) },
    { label: "Куріння", value: getLabel(SMOKING_OPTIONS, profile.smoking) },
  ];


  return <div className="space-y-4">
    <Card>
      <CardContent className="space-y-5 p-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Про себе</h3>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
            {profile.bio ? (
              profile.bio
            ) : (
              <span className="italic text-muted-foreground/60">
                Розкажіть про себе, щоб іншим було легше познайомитися з вами.
              </span>
            )}
          </p>
        </div>

        {/* Парна сітка в 2 колонки */}
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2 border-t border-border/60 pt-4">
          {details.map(({ label, value }) => (
            <div
              key={label}
              className="flex justify-between items-center border-b border-border/50 pb-2 text-sm"
            >
              <span className="text-muted-foreground font-medium">{label}</span>
              {value ? (
                <span className="font-medium text-foreground text-right">{value}</span>
              ) : (
                <span className="text-xs text-muted-foreground/50 italic">Не вказано</span>
              )}
            </div>
          ))}
        </div>
        {/* Соціальні мережі */}
        <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Instagram</p>
            <p className="text-sm font-medium">
              {profile.instagramHandle ? (
                `@${profile.instagramHandle}`
              ) : (
                <span className="text-muted-foreground/50 italic">Не вказано</span>
              )}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Spotify</p>
            <p className="text-sm font-medium">
              {profile.spotifyHandle || (
                <span className="text-muted-foreground/50 italic">Не вказано</span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>

    <div className="grid gap-4 md:grid-cols-2">
      <Card><CardContent className="p-6"><h3 className="mb-3 text-lg font-semibold">Інтереси</h3><div className="flex flex-wrap gap-2">{profile.interests.length ? profile.interests.map((item) => <Badge variant="secondary" key={item.id}>{item.name}</Badge>) : <p className="text-sm text-muted-foreground">Ще не додано</p>}</div></CardContent></Card>
      <Card><CardContent className="p-6"><h3 className="mb-3 text-lg font-semibold">Мови</h3><div className="flex flex-wrap gap-2">{profile.languages.length ? profile.languages.map((item) => <Badge variant="secondary" key={item.id}>{item.name}</Badge>) : <p className="text-sm text-muted-foreground">Ще не додано</p>}</div></CardContent></Card>
    </div>

    <Card><CardContent className="space-y-4 p-6"><h3 className="text-lg font-semibold">Мої відповіді</h3>{profile.promptAnswers.length ? profile.promptAnswers.map((answer) => <div className="border-b border-border/60 pb-3 last:border-0 last:pb-0" key={answer.promptId}><p className="text-sm text-muted-foreground">{answer.question}</p><p className="mt-1 text-sm">{answer.answer}</p></div>) : <p className="text-sm text-muted-foreground">Відповідей ще немає</p>}</CardContent></Card>
  </div>
}
