import { useEffect, useState } from "react"
import { ArrowLeft, Save } from "lucide-react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error"
import { getLookups, getMyProfile, updateMyLocation, updateMyPreferences, updateMyVisibility, type Lookups, type MyProfile } from "@/services/auth-service"

export default function ProfileSettingsPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [lookups, setLookups] = useState<Lookups | null>(null)
  const [showMe, setShowMe] = useState("")
  const [minAge, setMinAge] = useState(18)
  const [maxAge, setMaxAge] = useState(99)
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(50)
  const [isPrivate, setIsPrivate] = useState(false)
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

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
        await updateMyLocation(Number(latitude), Number(longitude))
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

  if (isLoading) return <div className="container mx-auto px-4 py-8">Завантаження налаштувань...</div>
  if (!profile || !lookups) return <div className="container mx-auto px-4 py-8">Налаштування недоступні.</div>

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-3xl flex-1 flex-col px-4 py-6">
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
                  <select
                    id="showMe"
                    className="h-9 rounded-2xl border border-transparent bg-input/50 px-3 text-sm"
                    value={showMe}
                    onChange={(event) => setShowMe(event.target.value)}
                  >
                    <option value="">Виберіть варіант</option>
                    {lookups.options.showMe?.map((value) => (
                      <option value={value} key={value}>
                        {value}
                      </option>
                    ))}
                  </select>
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

                  <label className="mt-2 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={maxDistanceKm === null}
                      onChange={(event) => setMaxDistanceKm(event.target.checked ? null : 50)}
                    />
                    Без обмежень
                  </label>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Конфіденційність</CardTitle>
            </CardHeader>

            <CardContent>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={isPrivate}
                  onChange={(event) => setIsPrivate(event.target.checked)}
                />
                Приховати мій профіль з пошуку
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Локація</CardTitle>
            </CardHeader>

            <CardContent>
              <FieldGroup className="grid gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="latitude">Широта</FieldLabel>
                  <Input
                    id="latitude"
                    type="number"
                    min={-90}
                    max={90}
                    placeholder="Наприклад, 50.45"
                    value={latitude}
                    onChange={(event) => setLatitude(event.target.value)}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="longitude">Довгота</FieldLabel>
                  <Input
                    id="longitude"
                    type="number"
                    min={-180}
                    max={180}
                    placeholder="Наприклад, 30.52"
                    value={longitude}
                    onChange={(event) => setLongitude(event.target.value)}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </main>
      </ScrollArea>
    </div>
  )
}
