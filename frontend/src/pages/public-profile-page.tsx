import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Heart, MessageCircle, HeartHandshake } from "lucide-react";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import { getPublicProfile, type PublicProfile } from "@/services/auth-service"; // перевір свій шлях імпорту
import { getApiErrorMessage } from "@/lib/api-error";
import { toast } from "@/components/ui/toast";

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
} from "@/lib/some-lookups";

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Lightbox для фото
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [lightboxCurrentIndex, setLightboxCurrentIndex] = useState(0);
  const [lightboxCarouselApi, setLightboxCarouselApi] = useState<CarouselApi | null>(null);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    async function loadProfile() {
      try {
        setIsLoading(true);
        const result = await getPublicProfile(id!);
        if (isMounted) {
          setProfile(result);
        }
      } catch (error: unknown) {
        if (isMounted) {
          toast.add({
            type: "error",
            title: "Не вдалося завантажити профіль",
            description: getApiErrorMessage(error, "Спробуйте ще раз."),
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [id]);

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

  if (isLoading) {
    return <div className="container mx-auto px-4 py-6">Завантаження профілю...</div>;
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-6 text-center space-y-4">
        <p>Профіль користувача не знайдено.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 size-4" /> Повернутися
        </Button>
      </div>
    );
  }

  const displayName = profile.displayName;
  const initials = displayName
    ? displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const mainPhoto = profile.photos.find((photo) => photo.isMain) ?? profile.photos[0];
  const profilePicture = mainPhoto?.url;

  const photos = profile.photos
    ? [...profile.photos].sort((a, b) => {
      if (a.isMain !== b.isMain) return a.isMain ? -1 : 1;
      return a.order - b.order;
    })
    : [];
  const count = photos.length;

  return (
    <div className="mx-auto flex h-full min-h-0 w-full flex-1 flex-col">
      <ScrollArea className="h-full min-h-0 flex-1">
        <div className="container mx-auto px-4 py-6 md:px-6 2xl:max-w-350">
          {/* Шапка з кнопкою "Назад" */}
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 size-4" />
              Назад
            </Button>
            <h1 className="text-xl font-semibold text-foreground">Профіль користувача <span className="font-bold">{displayName}</span></h1>
            <div className="w-16" /> {/* Для балансу флексу */}
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {/* Sidebar (Ліва колонка) */}
            <div className="md:col-span-1">
              <Card className="p-0">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <Avatar className="size-20">
                      <AvatarImage src={profilePicture ?? undefined} alt={displayName} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <h2 className="mt-4 text-lg font-semibold">{displayName}</h2>
                    {profile.city && (
                      <p className="text-muted-foreground text-sm mt-0.5">{profile.city}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Фотографії (без кнопки додавання) */}
              {count > 0 && (
                <Card className="mt-4 p-0">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-center pb-3">
                      <h3 className="text-lg font-semibold">Фотографії</h3>
                    </div>

                    {/* 1 фото */}
                    {count === 1 && (
                      <div className="grid grid-cols-1 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setLightboxCurrentIndex(0);
                            setLightboxIndex(0);
                          }}
                          className="aspect-[4/5] relative overflow-hidden rounded-2xl"
                        >
                          <img src={photos[0].url} alt="Main photo" className="size-full object-cover" />
                        </button>
                      </div>
                    )}

                    {/* 2 фото */}
                    {count === 2 && (
                      <div className="grid grid-cols-2 gap-3">
                        {photos.map((photo, index) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => {
                              setLightboxCurrentIndex(index);
                              setLightboxIndex(index);
                            }}
                            className="aspect-square relative overflow-hidden rounded-2xl"
                          >
                            <img src={photo.url} alt="Photo" className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Від 3 до 6 фото */}
                    {count >= 3 && count < 7 && (
                      <div className="grid grid-cols-2 gap-3">
                        {photos.map((photo, index) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => {
                              setLightboxCurrentIndex(index);
                              setLightboxIndex(index);
                            }}
                            className="aspect-square relative overflow-hidden rounded-2xl"
                          >
                            <img src={photo.url} alt="Photo" className="size-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* 7+ фото */}
                    {count >= 7 && (
                      <div className="grid grid-cols-2 gap-3">
                        {photos.slice(0, 3).map((photo, index) => (
                          <button
                            key={photo.id}
                            type="button"
                            onClick={() => {
                              setLightboxCurrentIndex(index);
                              setLightboxIndex(index);
                            }}
                            className="aspect-square relative overflow-hidden rounded-2xl"
                          >
                            <img src={photo.url} alt={`Photo ${index + 1}`} className="size-full object-cover" />
                          </button>
                        ))}
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
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Main Content (Права колонка) */}
            <div className="space-y-4 md:col-span-3">
              <PublicProfileDetails profile={profile} />
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Lightbox перегляд фотографій */}
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
    </div>
  );
}

function PublicProfileDetails({ profile }: { profile: PublicProfile }) {
  // Список усіх харатеристик
  const rawDetails = [
    { label: "Місто", value: profile.city },
    { label: "Вік", value: profile.age ? `${profile.age} років` : null },
    { label: "Орієнтація", value: getLabel(ORIENTATION_OPTIONS, profile.orientation) },
    { label: "Мова кохання", value: getLabel(LOVE_STYLE_OPTIONS, profile.loveLanguage) },
    { label: "Стиль спілкування", value: getLabel(COMMUNICATION_OPTIONS, profile.communication) },
    { label: "Шукає", value: getLabel(GOAL_OPTIONS, profile.lookingFor) },
    { label: "Знак зодіаку", value: getLabel(ZODIAC_OPTIONS, profile.zodiac) },
    { label: "Плани на сім'ю", value: getLabel(FAMILY_PLAN_OPTIONS, profile.familyPlans) },
    { label: "Домашні тварини", value: getLabel(PET_OPTIONS, profile.pets) },
    { label: "Освіта", value: profile.school },
    { label: "Рід занять", value: profile.occupation },
    { label: "Компанія", value: profile.company },
    { label: "Спорт", value: getLabel(WORKOUT_OPTIONS, profile.workout) },
    { label: "Зріст", value: profile.heightCm ? `${profile.heightCm} см` : null },
    { label: "Алкоголь", value: getLabel(DRINKING_OPTIONS, profile.drinking) },
    { label: "Куріння", value: getLabel(SMOKING_OPTIONS, profile.smoking) },
  ];

  // 💥 ФІЛЬТР: залишаємо лише ті поля, у яких реально є значення!
  const availableDetails = rawDetails.filter((item) => Boolean(item.value));

  return (
    <div className="space-y-4">
      {/* Про себе та деталі */}
      <Card>
        <CardContent className="space-y-5 p-6">
          {profile.bio && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Про себе</h3>
              <p className="whitespace-pre-wrap text-sm text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Відображаємо сітку тільки якщо є хоча б одне заповнене поле */}
          {availableDetails.length > 0 && (
            <div className={`grid gap-x-8 gap-y-3 sm:grid-cols-2 ${profile.bio ? "border-t border-border/60 pt-4" : ""}`}>
              {availableDetails.map(({ label, value }) => (
                <div
                  key={label}
                  className="flex justify-between items-center border-b border-border/50 pb-2 text-sm"
                >
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <span className="font-medium text-foreground text-right">{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Соціальні мережі (показуємо лише заповнені) */}
          {(profile.instagramHandle || profile.spotifyHandle) && (
            <div className="grid gap-4 border-t border-border/60 pt-4 sm:grid-cols-2">
              {profile.instagramHandle && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Instagram</p>
                  <p className="text-sm font-medium">@{profile.instagramHandle}</p>
                </div>
              )}
              {profile.spotifyHandle && (
                <div>
                  <p className="mb-1 text-xs text-muted-foreground">Spotify</p>
                  <p className="text-sm font-medium">{profile.spotifyHandle}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Інтереси та Мови (приховуємо картку повністю, якщо масив порожній) */}
      {(profile.interests.length > 0 || profile.languages.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {profile.interests.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold">Інтереси</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((item) => (
                    <Badge variant="secondary" key={item.id}>
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.languages.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-3 text-lg font-semibold">Мови</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((item) => (
                    <Badge variant="secondary" key={item.id}>
                      {item.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Відповіді на запитання (приховуємо, якщо немає відповідей) */}
      {profile.promptAnswers.length > 0 && (
        <Card>
          <CardContent className="space-y-4 p-6">
            <h3 className="text-lg font-semibold">Відповіді</h3>
            <div className="space-y-3">
              {profile.promptAnswers.map((answer) => (
                <div
                  className="border-b border-border/60 pb-3 last:border-0 last:pb-0"
                  key={answer.promptId}
                >
                  <p className="text-sm text-muted-foreground">{answer.question}</p>
                  <p className="mt-1 text-sm font-semibold">{answer.answer}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}