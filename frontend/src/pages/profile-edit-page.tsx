import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router"
import { ArrowLeft, ImagePlus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error"
import {
  deleteProfilePhoto,
  getLookups,
  getMyProfile,
  setMainProfilePhoto,
  updateMyInterests,
  updateMyLanguages,
  updateMyProfile,
  updateMyPrompts,
  uploadProfilePhoto,
  type Lookups,
  type MyProfile,
  type PromptAnswerInput,
  type UpdateProfileRequest,
} from "@/services/auth-service"

const profileFields: Array<{ key: keyof UpdateProfileRequest; label: string; type?: "textarea" }> = [
  { key: "displayName", label: "Ім'я" },
  { key: "bio", label: "Про себе", type: "textarea" },
  { key: "occupation", label: "Заняття" },
  { key: "company", label: "Компанія" },
  { key: "school", label: "Освіта" },
  { key: "instagramHandle", label: "Instagram" },
  { key: "spotifyHandle", label: "Spotify" },
]

const enumFields: Array<{ key: keyof UpdateProfileRequest; label: string; optionKey: string }> = [
  { key: "gender", label: "Стать", optionKey: "gender" },
  { key: "orientation", label: "Орієнтація", optionKey: "orientation" },
  { key: "lookingFor", label: "Шукаю", optionKey: "lookingFor" },
  { key: "familyPlans", label: "Сімейні плани", optionKey: "familyPlans" },
  { key: "communication", label: "Спілкування", optionKey: "communication" },
  { key: "loveLanguage", label: "Мова кохання", optionKey: "loveLanguage" },
  { key: "pets", label: "Домашні тварини", optionKey: "pets" },
  { key: "drinking", label: "Алкоголь", optionKey: "drinking" },
  { key: "smoking", label: "Куріння", optionKey: "smoking" },
  { key: "workout", label: "Спорт", optionKey: "workout" },
]

function emptyForm(): UpdateProfileRequest {
  return {
    displayName: "",
    gender: "",
    orientation: null,
    bio: null,
    occupation: null,
    company: null,
    school: null,
    heightCm: null,
    lookingFor: null,
    familyPlans: null,
    communication: null,
    loveLanguage: null,
    pets: null,
    drinking: null,
    smoking: null,
    workout: null,
    instagramHandle: null,
    spotifyHandle: null,
  }
}

function formFromProfile(profile: MyProfile): UpdateProfileRequest {
  return {
    displayName: profile.displayName,
    gender: profile.gender,
    orientation: profile.orientation,
    bio: profile.bio,
    occupation: profile.occupation,
    company: profile.company,
    school: profile.school,
    heightCm: profile.heightCm,
    lookingFor: profile.lookingFor,
    familyPlans: profile.familyPlans,
    communication: profile.communication,
    loveLanguage: profile.loveLanguage,
    pets: profile.pets,
    drinking: profile.drinking,
    smoking: profile.smoking,
    workout: profile.workout,
    instagramHandle: profile.instagramHandle,
    spotifyHandle: profile.spotifyHandle,
  }
}

export default function ProfileEditPage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [lookups, setLookups] = useState<Lookups | null>(null)
  const [form, setForm] = useState<UpdateProfileRequest>(emptyForm)
  const [interestIds, setInterestIds] = useState<number[]>([])
  const [languageIds, setLanguageIds] = useState<number[]>([])
  const [promptAnswers, setPromptAnswers] = useState<PromptAnswerInput[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    void Promise.all([getMyProfile(), getLookups()]).then(([nextProfile, nextLookups]) => {
      setProfile(nextProfile)
      setLookups(nextLookups)
      setForm(formFromProfile(nextProfile))
      setInterestIds(nextProfile.interests.map((item) => item.id))
      setLanguageIds(nextProfile.languages.map((item) => item.id))
      setPromptAnswers(nextProfile.promptAnswers.map(({ promptId, answer }) => ({ promptId, answer })))
    }).catch((error: unknown) => {
      toast.add({ type: "error", title: "Не вдалося завантажити профіль", description: getApiErrorMessage(error, "Спробуйте ще раз.") })
    }).finally(() => setIsLoading(false))
  }, [])

  function updateField(key: keyof UpdateProfileRequest, value: string) {
    setForm((current) => ({ ...current, [key]: value || null }))
  }

  function toggleId(ids: number[], id: number, limit: number, setter: (value: number[]) => void) {
    if (ids.includes(id)) {
      setter(ids.filter((item) => item !== id))
    } else if (ids.length < limit) {
      setter([...ids, id])
    }
  }

  async function save() {
    setIsSaving(true)
    try {
      await updateMyProfile({ ...form, heightCm: form.heightCm ? Number(form.heightCm) : null })
      await updateMyInterests(interestIds)
      await updateMyLanguages(languageIds)
      await updateMyPrompts(promptAnswers.filter((item) => item.promptId > 0 && item.answer.trim()))
      const [nextProfile, nextLookups] = await Promise.all([getMyProfile(), getLookups()])
      setProfile(nextProfile)
      setLookups(nextLookups)
      setForm(formFromProfile(nextProfile))
      setInterestIds(nextProfile.interests.map((item) => item.id))
      setLanguageIds(nextProfile.languages.map((item) => item.id))
      setPromptAnswers(nextProfile.promptAnswers.map(({ promptId, answer }) => ({ promptId, answer })))
      toast.add({ type: "success", title: "Профіль збережено" })
    } catch (error: unknown) {
      toast.add({ type: "error", title: "Не вдалося зберегти профіль", description: getApiErrorMessage(error, "Перевірте заповнені поля.") })
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePhoto(file: File) {
    try {
      await uploadProfilePhoto(file)
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Фото додано" })
    } catch (error: unknown) {
      toast.add({ type: "error", title: "Не вдалося додати фото", description: getApiErrorMessage(error, "Перевірте формат і розмір файлу.") })
    }
  }

  async function removePhoto(photoId: string) {
    try {
      await deleteProfilePhoto(photoId)
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
    } catch (error: unknown) {
      toast.add({ type: "error", title: "Не вдалося видалити фото", description: getApiErrorMessage(error, "Спробуйте ще раз.") })
    }
  }

  async function makeMain(photoId: string) {
    try {
      await setMainProfilePhoto(photoId)
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
    } catch (error: unknown) {
      toast.add({ type: "error", title: "Не вдалося змінити головне фото", description: getApiErrorMessage(error, "Спробуйте ще раз.") })
    }
  }

  if (isLoading) return <div className="container mx-auto px-4 py-8">Завантаження профілю...</div>
  if (!profile || !lookups) return <div className="container mx-auto px-4 py-8">Профіль недоступний.</div>

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col">
      <ScrollArea className="h-full min-h-0 flex-1 px-4">
        <main className="space-y-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button variant="ghost" size="sm" onClick={() => navigate("/me")}><ArrowLeft className="mr-2 size-4" />Назад</Button>
          <h1 className="mt-3 text-3xl font-semibold">Редагування профілю</h1>
        </div>
        <Button onClick={() => void save()} disabled={isSaving}><Save className="mr-2 size-4" />{isSaving ? "Зберігаємо..." : "Зберегти"}</Button>
      </div>

      <Card><CardHeader><CardTitle>Про вас</CardTitle></CardHeader><CardContent><FieldGroup className="grid gap-4 md:grid-cols-2">
        {profileFields.map(({ key, label, type }) => <Field key={key}><FieldLabel htmlFor={key}>{label}</FieldLabel>{type === "textarea" ? <Textarea id={key} value={form[key] ?? ""} onChange={(event) => updateField(key, event.target.value)} maxLength={500} /> : <Input id={key} value={form[key] ?? ""} onChange={(event) => updateField(key, event.target.value)} />}</Field>)}
        <Field><FieldLabel htmlFor="heightCm">Зріст, см</FieldLabel><Input id="heightCm" type="number" min={120} max={250} value={form.heightCm ?? ""} onChange={(event) => setForm((current) => ({ ...current, heightCm: event.target.value ? Number(event.target.value) : null }))} /></Field>
      </FieldGroup></CardContent></Card>

      <Card><CardHeader><CardTitle>Вподобання анкети</CardTitle></CardHeader><CardContent><FieldGroup className="grid gap-4 md:grid-cols-2">
        {enumFields.map(({ key, label, optionKey }) => <Field key={key}><FieldLabel htmlFor={key}>{label}</FieldLabel><select id={key} className="h-9 rounded-2xl border border-transparent bg-input/50 px-3 text-sm" value={form[key] ?? ""} onChange={(event) => updateField(key, event.target.value)}><option value="">Не вказано</option>{(lookups.options[optionKey] ?? []).map((value) => <option key={value} value={value}>{value}</option>)}</select></Field>)}
      </FieldGroup></CardContent></Card>

      <Card><CardHeader><CardTitle>Інтереси та мови</CardTitle></CardHeader><CardContent className="grid gap-6 md:grid-cols-2"><ChoiceList title="Інтереси, до 5" items={lookups.interests} selected={interestIds} onToggle={(id) => toggleId(interestIds, id, 5, setInterestIds)} /><ChoiceList title="Мови, до 10" items={lookups.languages} selected={languageIds} onToggle={(id) => toggleId(languageIds, id, 10, setLanguageIds)} /></CardContent></Card>

      <Card><CardHeader><CardTitle>Запитання</CardTitle></CardHeader><CardContent className="space-y-4">{[0, 1, 2].map((index) => { const answer = promptAnswers[index] ?? { promptId: 0, answer: "" }; return <div className="grid gap-2 md:grid-cols-2" key={index}><select className="h-9 rounded-2xl border border-transparent bg-input/50 px-3 text-sm" value={answer.promptId || ""} onChange={(event) => setPromptAnswers((current) => { const next = [...current]; next[index] = { ...answer, promptId: Number(event.target.value) }; return next })}><option value="">Оберіть запитання</option>{lookups.prompts.map((prompt) => <option key={prompt.id} value={prompt.id}>{prompt.name}</option>)}</select><Textarea placeholder="Ваша відповідь" maxLength={124} value={answer.answer} onChange={(event) => setPromptAnswers((current) => { const next = [...current]; next[index] = { ...answer, answer: event.target.value }; return next })} /></div> })}</CardContent></Card>

      <Card><CardHeader><CardTitle>Фотографії</CardTitle></CardHeader><CardContent className="space-y-4"><label className="inline-flex cursor-pointer items-center rounded-2xl bg-primary px-4 py-2 text-sm text-primary-foreground"><ImagePlus className="mr-2 size-4" />Додати фото<input className="hidden" type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handlePhoto(file) }} /></label><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{profile.photos.map((photo) => <div className="space-y-2" key={photo.id}><img src={photo.url} alt="Фото профілю" className="aspect-square w-full rounded-2xl object-cover" /> <div className="flex gap-1"><Button size="sm" variant={photo.isMain ? "secondary" : "outline"} disabled={photo.isMain} onClick={() => void makeMain(photo.id)}>{photo.isMain ? "Головне" : "Зробити головним"}</Button><Button size="icon" variant="ghost" aria-label="Видалити фото" onClick={() => void removePhoto(photo.id)}><Trash2 className="size-4" /></Button></div></div>)}</div></CardContent></Card>
      <div className="flex justify-end"><Link to="/settings"><Button variant="outline">Перейти до налаштувань</Button></Link></div>
        </main>
      </ScrollArea>
    </div>
  )
}

function ChoiceList({ title, items, selected, onToggle }: { title: string; items: { id: number; name: string }[]; selected: number[]; onToggle: (id: number) => void }) {
  return <fieldset><legend className="mb-3 text-sm font-medium">{title}</legend><div className="grid gap-2 sm:grid-cols-2">{items.map((item) => <label className="flex items-center gap-2 text-sm" key={item.id}><input type="checkbox" checked={selected.includes(item.id)} onChange={() => onToggle(item.id)} />{item.name}</label>)}</div></fieldset>
}
