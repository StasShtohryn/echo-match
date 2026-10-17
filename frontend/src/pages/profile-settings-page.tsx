import { useEffect, useState } from "react"
import { ArrowLeft, LocateFixed, Save } from "lucide-react"
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
import { saveMyLocation } from "@/lib/location"
import { getLookups, getMyProfile, updateMyPreferences, updateMyVisibility, type Lookups, type MyProfile } from "@/services/auth-service"

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
      if (latitude.trim() && longitude.trim()) {
        await saveMyLocation(Number(latitude), Number(longitude))
      }
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Налаштування збережено" })
    } catch (error: unknown) {
      toast.add({ type: "error", title: "Не вдалося зберегти налаштування", description: getApiErrorMessage(error, "Перевірте значення полів.") })
    } finally {
      setIsSaving(false)
    }
  }

  async function updateLocation() {
    setIsUpdatingLocation(true)
    try {
      await updateLocationFromDevice()
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Локацію оновлено" })
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Не вдалося оновити локацію",
        description: getApiErrorMessage(error, "Перевірте дозвіл браузера та спробуйте ще раз."),
      })
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8">Завантаження налаштувань...</div>
  if (!profile || !lookups) return <div className="container mx-auto px-4 py-8">Налаштування недоступні.</div>

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-6 ">
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

          <Card>
            <CardHeader>
              <CardTitle>Кого показувати</CardTitle>
            </CardHeader>

            <CardContent>
              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="showMe">Показувати</FieldLabel>
                  <Select value={showMe} onValueChange={(value) => setShowMe(value ?? "")}>
                    <SelectTrigger id="showMe" className="w-full">
                      <SelectValue placeholder="Виберіть варіант" />
                    </SelectTrigger>
                    <SelectContent>
                      {lookups.options.showMe?.map((value) => (
                        <SelectItem value={value} key={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="maxDistanceKm">Максимальна дистанція, км</FieldLabel>
                  <Input
                    id="maxDistanceKm"
                    type="number"
                    min={1}
                    max={160}
                    disabled={maxDistanceKm === null}
                    value={maxDistanceKm ?? ""}
                    onChange={(event) => setMaxDistanceKm(event.target.value ? Number(event.target.value) : null)}
                  />

                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Checkbox
                      id="unlimitedDistance"
                      checked={maxDistanceKm === null}
                      onCheckedChange={(checked) => setMaxDistanceKm(checked === true ? null : 50)}
                    />
                    <label htmlFor="unlimitedDistance" className="cursor-pointer">Без обмежень</label>
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="minAge">Вік від</FieldLabel>
                  <Input
                    id="minAge"
                    type="number"
                    min={18}
                    max={99}
                    value={minAge}
                    onChange={(event) => setMinAge(Number(event.target.value))}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="maxAge">Вік до</FieldLabel>
                  <Input
                    id="maxAge"
                    type="number"
                    min={18}
                    max={99}
                    value={maxAge}
                    onChange={(event) => setMaxAge(Number(event.target.value))}
                  />
                </Field>
              </FieldGroup>
              <p className="mt-3 text-sm text-muted-foreground">
                Місто в профілі: <span className="font-medium text-foreground">{profile.city ?? "не визначено"}</span>.
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Конфіденційність</CardTitle>
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

          <Card>
            <CardHeader>
              <CardTitle>Локація</CardTitle>
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
                  onClick={() => void updateLocation()}
                  disabled={isUpdatingLocation || isSaving}
                >
                  <LocateFixed className="size-4" />
                  {isUpdatingLocation ? "Оновлюємо локацію..." : "Оновити локацію"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </ScrollArea>
    </div>
  )
}
