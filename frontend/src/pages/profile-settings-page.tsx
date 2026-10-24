import { useEffect, useState } from "react"
import { ArrowLeft, LocateFixed, MapPin, Save } from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error"
import { saveMyLocation, updateLocationFromDevice } from "@/lib/location"
import { getLookups, getMyProfile, updateMyPreferences, updateMyVisibility, type Lookups, type MyProfile } from "@/services/auth-service"
import { LocationPickerModal } from "@/components/location-picker-modal"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FilterPanel } from "@/components/filter-panel"

type ProfileWithCoords = MyProfile & {
  latitude?: number | null
  longitude?: number | null
}

export default function ProfileSettingsPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [lookups, setLookups] = useState<Lookups | null>(null)
  const [showMe, setShowMe] = useState("")
  const [minAge, setMinAge] = useState(18)
  const [maxAge, setMaxAge] = useState(99)
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(50)
  const [isPrivate, setIsPrivate] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [isLocationChoiceOpen, setIsLocationChoiceOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)

  useEffect(() => {
    Promise.all([getMyProfile(), getLookups()]).then(([nextProfile, nextLookups]) => {
      setProfile(nextProfile)
      setLookups(nextLookups)
      setShowMe(nextProfile.preferences?.showMe ?? "")
      setMinAge(nextProfile.preferences?.minAge ?? 18)
      setMaxAge(nextProfile.preferences?.maxAge ?? 99)
      setMaxDistanceKm(nextProfile.preferences?.maxDistanceKm ?? null)
      setIsPrivate(nextProfile.isPrivate)
    }).catch((error: unknown) => {
      toast.add({ type: "error", title: "Не вдалося завантажити налаштування", description: getApiErrorMessage(error, "Спробуйте ще раз.") })
    }).finally(() => setIsLoading(false))
  }, [])

  async function save() {
    if (!showMe || minAge < 18 || maxAge > 99 || minAge > maxAge || (maxDistanceKm !== null && (maxDistanceKm < 1 || maxDistanceKm > 160))) {
      toast.add({ type: "error", title: "Перевірте налаштування", description: "Укажіть коректний діапазон віку та дистанції." })
      return
    }
    setIsSaving(true)
    try {
      await updateMyPreferences({ showMe, minAge, maxAge, maxDistanceKm })
      await updateMyVisibility(isPrivate)
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Налаштування збережено" })
    } catch (error: unknown) {
      toast.add({ type: "error", title: "Не вдалося зберегти налаштування", description: getApiErrorMessage(error, "Перевірте значення полів.") })
    } finally {
      setIsSaving(false)
    }
  }

  // 1. Автоматичне визначення за GPS пристрою
  async function handleAutoLocation() {
    setIsLocationChoiceOpen(false)
    setIsUpdatingLocation(true)
    try {
      await updateLocationFromDevice()
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Локацію оновлено за GPS" })
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Не вдалося визначити геолокацію",
        description: getApiErrorMessage(
          error,
          "Перевірте дозволи браузера та спробуйте ще раз.",
        ),
      })
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  // 2. Збереження точці, обраної на карті
  async function handleLocationSelected(lat: number, lng: number) {
    setIsUpdatingLocation(true)
    try {
      await saveMyLocation(lat, lng)
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Локацію успішно оновлено" })
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Помилка оновлення",
        description: getApiErrorMessage(
          error,
          "Не вдалося зберегти вибрані координати.",
        ),
      })
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Завантаження налаштувань...</div>
  }

  if (!profile || !lookups) {
    return <div className="container mx-auto px-4 py-8">Налаштування недоступні.</div>
  }

  const profileCoords = profile as ProfileWithCoords


  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col px-4 py-6 ">
      <ScrollArea className="h-full min-h-0 flex-1">
        <main className="space-y-6 pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/me")}>
                <ArrowLeft className="mr-2 size-4" />
                Назад
              </Button>

              <h1 className="mt-3 text-3xl font-semibold">Налаштування</h1>
            </div>

            <Button onClick={() => void save()} disabled={isSaving}>
              <Save className="mr-2 size-4" />
              {isSaving ? "Зберігаємо..." : "Зберегти"}
            </Button>
          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="text-xl font-semibold font-sans">Кого показувати</CardTitle>
              </CardHeader>

              <CardContent>
                <FilterPanel
                  isSaving={isSaving}
                  initialPreferences={
                    profile?.preferences ?? {
                      showMe: showMe || "Women",
                      minAge: minAge || 18,
                      maxAge: maxAge || 99,
                      maxDistanceKm: maxDistanceKm,
                    }
                  }
                  onApply={(updatedPreferences) => {
                    // Зберігаємо нові налаштування
                    setShowMe(updatedPreferences.showMe)
                    setMinAge(updatedPreferences.minAge)
                    setMaxAge(updatedPreferences.maxAge)
                    setMaxDistanceKm(updatedPreferences.maxDistanceKm)
                    void save()
                  }}
                />
              </CardContent>
            </Card>

            <div className="flex flex-col justify-between gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold font-sans">Конфіденційність</CardTitle>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center gap-3 text-sm">
                    <Checkbox
                      id="isPrivate"
                      checked={isPrivate}
                      onCheckedChange={(checked) => setIsPrivate(checked === true)}
                    />
                    <label htmlFor="isPrivate" className="cursor-pointer">Приховати мій профіль з пошуку</label>
                  </div>
                </CardContent>
              </Card>

              {/* Блок Локації */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold font-sans">
                    Локація
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Поточне місто:{" "}
                        <span className="font-medium text-foreground">
                          {profile.city ?? "не визначено"}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Місто визначається за координатами через{" "}
                        <a
                          href="https://www.openstreetmap.org/copyright"
                          target="_blank"
                          rel="noreferrer"
                          className="underline underline-offset-4"
                        >
                          OpenStreetMap
                        </a>
                        .
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => setIsLocationChoiceOpen(true)}
                      disabled={isUpdatingLocation || isSaving}
                    >
                      <LocateFixed className="size-4 mr-2" />
                      {isUpdatingLocation ? "Оновлюємо..." : "Оновити геолокацію"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Діалогове вікно вибору способу оновлення геолокації */}
          <AlertDialog
            open={isLocationChoiceOpen}
            onOpenChange={setIsLocationChoiceOpen}
          >
            <AlertDialogContent className="sm:max-w-md text-center">
              <AlertDialogHeader className="flex flex-col items-center text-center sm:text-center">
                <AlertDialogTitle className="font-sans text-center w-full">
                  Спосіб оновлення геолокації
                </AlertDialogTitle>
                <AlertDialogDescription className="text-center">
                  Оберіть, як саме ви бажаєте вказати своє поточне місцезнаходження.
                </AlertDialogDescription >
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:items-center">
                <Button
                  className="w-full justify-center"
                  onClick={() => void handleAutoLocation()}
                >
                  <LocateFixed className="size-4 mr-2" />
                  Автоматично (за GPS пристрою)
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-center"
                  onClick={() => {
                    setIsLocationChoiceOpen(false)
                    setIsMapOpen(true)
                  }}
                >
                  <MapPin className="size-4 mr-2" />
                  Обрати точку вручну на карті
                </Button>
                <AlertDialogCancel className="mt-2 w-full justify-center">Скасувати</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Модальне вікно з картами */}
          {isMapOpen && (
            <LocationPickerModal
              initialLat={profileCoords.latitude ?? 50.4501}
              initialLng={profileCoords.longitude ?? 30.5234}
              onClose={() => setIsMapOpen(false)}
              onSelectLocation={handleLocationSelected}
            />
          )}
        </main>
      </ScrollArea>
    </div>
  )
}