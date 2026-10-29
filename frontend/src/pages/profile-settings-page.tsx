import { useEffect, useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error"
import { saveMyLocation, updateLocationFromDevice } from "@/lib/location"
import {
  getLookups,
  getMyProfile,
  updateMyPreferences,
  updateMyVisibility,
  type Lookups,
  type MyProfile,
  type UpdatePreferencesRequest,
} from "@/services/auth-service"
import { SettingsSections } from "@/components/settings"

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
    Promise.all([getMyProfile(), getLookups()])
      .then(([nextProfile, nextLookups]) => {
        setProfile(nextProfile)
        setLookups(nextLookups)
        setShowMe(nextProfile.preferences?.showMe ?? "")
        setMinAge(nextProfile.preferences?.minAge ?? 18)
        setMaxAge(nextProfile.preferences?.maxAge ?? 99)
        setMaxDistanceKm(nextProfile.preferences?.maxDistanceKm ?? null)
        setIsPrivate(nextProfile.isPrivate)
      })
      .catch((error: unknown) => {
        toast.add({
          type: "error",
          title: "Не вдалося завантажити налаштування",
          description: getApiErrorMessage(error, "Спробуйте ще раз."),
        })
      })
      .finally(() => setIsLoading(false))
  }, [])

  async function handleSave() {
    if (
      !showMe ||
      minAge < 18 ||
      maxAge > 99 ||
      minAge > maxAge ||
      (maxDistanceKm !== null && (maxDistanceKm < 1 || maxDistanceKm > 160))
    ) {
      toast.add({
        type: "error",
        title: "Перевірте налаштування",
        description: "Укажіть коректний діапазон віку та дистанції.",
      })
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
      toast.add({
        type: "error",
        title: "Не вдалося зберегти налаштування",
        description: getApiErrorMessage(error, "Перевірте значення полів."),
      })
    } finally {
      setIsSaving(false)
    }
  }

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

  function handleApplyFilters(updatedPreferences: UpdatePreferencesRequest) {
    setShowMe(updatedPreferences.showMe)
    setMinAge(updatedPreferences.minAge)
    setMaxAge(updatedPreferences.maxAge)
    setMaxDistanceKm(updatedPreferences.maxDistanceKm)
    setProfile((prev) =>
      prev
        ? {
          ...prev,
          preferences: {
            ...prev.preferences,
            showMe: updatedPreferences.showMe,
            minAge: updatedPreferences.minAge,
            maxAge: updatedPreferences.maxAge,
            maxDistanceKm: updatedPreferences.maxDistanceKm,
          },
        }
        : null
    )
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Завантаження налаштувань...</div>
  }

  if (!profile || !lookups) {
    return <div className="container mx-auto px-4 py-8">Налаштування недоступні.</div>
  }

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col px-4 py-6">
      <ScrollArea className="h-full min-h-0 flex-1">
        <main className="space-y-6 pb-4">
          {/* Шапка з кнопками Назад і Зберегти */}
          <div className="flex items-center justify-between gap-3">
            <div>
              <Button variant="ghost" size="sm" onClick={() => navigate("/me")}>
                <ArrowLeft className="mr-2 size-4" />
                Назад
              </Button>

              <h1 className="mt-3 text-3xl font-semibold">Налаштування</h1>
            </div>

            <Button onClick={() => void handleSave()} disabled={isSaving}>
              <Save className="mr-2 size-4" />
              {isSaving ? "Зберігаємо..." : "Зберегти"}
            </Button>
          </div>

          {/* Винесена розмітка всіх блоків налаштувань */}
          <SettingsSections
            profile={profile}
            lookups={lookups}
            showMe={showMe}
            minAge={minAge}
            maxAge={maxAge}
            maxDistanceKm={maxDistanceKm}
            isPrivate={isPrivate}
            isSaving={isSaving}
            isUpdatingLocation={isUpdatingLocation}
            isLocationChoiceOpen={isLocationChoiceOpen}
            isMapOpen={isMapOpen}
            onIsPrivateChange={setIsPrivate}
            onApplyFilters={handleApplyFilters}
            onOpenLocationChoice={() => setIsLocationChoiceOpen(true)}
            onCloseLocationChoice={setIsLocationChoiceOpen}
            onAutoLocation={() => void handleAutoLocation()}
            onOpenMap={() => {
              setIsLocationChoiceOpen(false)
              setIsMapOpen(true)
            }}
            onCloseMap={() => setIsMapOpen(false)}
            onLocationSelected={(lat, lng) => void handleLocationSelected(lat, lng)}
          />
        </main>
      </ScrollArea>
    </div>
  )
}
