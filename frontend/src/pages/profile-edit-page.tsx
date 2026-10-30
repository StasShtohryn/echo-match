import { useEffect, useMemo, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import {
  ArrowLeft,
  BadgeCheck,
  Briefcase,
  Building2,
  Check,
  Cigarette,
  Compass,
  Dog,
  Dumbbell,
  GraduationCap,
  Heart,
  LoaderCircle,
  MessageCircle,
  Music,
  Plus,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Star,
  Trash2,
  User,
  Users,
  Wine,
  X,
} from "lucide-react"

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { useUIStore } from "@/store/useUIStore"
import { getApiErrorMessage } from "@/lib/api-error"
import { cn } from "@/lib/utils"
import {
  COMMUNICATION_OPTIONS,
  DRINKING_OPTIONS,
  FAMILY_PLAN_OPTIONS,
  GOAL_OPTIONS,
  LOVE_STYLE_OPTIONS,
  ORIENTATION_OPTIONS,
  PET_OPTIONS,
  SMOKING_OPTIONS,
  WORKOUT_OPTIONS,
} from "@/lib/some-lookups"
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
  type LookupItem,
  type MyProfile,
  type PromptAnswerInput,
  type UpdateProfileRequest,
} from "@/services/auth-service"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { REGIONS, INSTITUTION_CATEGORIES } from "@/data/regions"
import { getUniversities, type UniversityItem } from "@/services/auth-service"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

const noSelectionValue = "__not_specified__"
const MAX_PHOTOS = 6

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

const GENDER_OPTIONS: Record<string, string> = {
  Man: "Чоловік",
  Woman: "Жінка",
  Other: "Інше",
  Male: "Чоловік",
  Female: "Жінка",
}

function getOptionLabel(optionKey: string, value: string): string {
  if (!value) return ""
  switch (optionKey) {
    case "gender":
      return GENDER_OPTIONS[value] ?? value
    case "orientation":
      return ORIENTATION_OPTIONS[value] ?? value
    case "lookingFor":
      return GOAL_OPTIONS[value] ?? value
    case "familyPlans":
      return FAMILY_PLAN_OPTIONS[value] ?? value
    case "communication":
      return COMMUNICATION_OPTIONS[value] ?? value
    case "loveLanguage":
      return LOVE_STYLE_OPTIONS[value] ?? value
    case "pets": {
      if (Array.isArray(value)) {
        return value.map((pet) => PET_OPTIONS[pet] ?? pet).join(", ")
      }
      if (typeof value === "string" && value.includes(",")) {
        return value
          .split(",")
          .map((p) => p.trim())
          .map((pet) => PET_OPTIONS[pet] ?? pet)
          .join(", ")
      }
      return PET_OPTIONS[value] ?? value
    }
    case "drinking":
      return DRINKING_OPTIONS[value] ?? value
    case "smoking":
      return SMOKING_OPTIONS[value] ?? value
    case "workout":
      return WORKOUT_OPTIONS[value] ?? value
    default:
      return value
  }
}

function SchoolSearchPicker({
  value,
  onChange,
}: {
  value: string | null
  onChange: (val: string | null) => void
}) {
  const [selectedRegion, setSelectedRegion] = useState<number | null>(80) // Киев
  const [selectedCategory, setSelectedCategory] = useState<number | null>(1) // ЗВО
  const [searchQuery, setSearchQuery] = useState(value ?? "")
  const [universities, setUniversities] = useState<UniversityItem[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  useEffect(() => {
    setSearchQuery(value ?? "")
  }, [value])

  const selectedRegionName = useMemo(() => {
    return REGIONS.find((r) => r.code === selectedRegion)?.name
  }, [selectedRegion])

  const selectedCategoryName = useMemo(() => {
    return INSTITUTION_CATEGORIES.find((c) => c.code === selectedCategory)?.name
  }, [selectedCategory])

  useEffect(() => {
    if (selectedRegion === null || selectedCategory === null) {
      setUniversities([])
      return
    }

    let isMounted = true
    async function fetchData() {
      try {
        setIsFetching(true)
        const list = await getUniversities(selectedRegion!, selectedCategory!)
        if (isMounted) setUniversities(list)
      } catch (err) {
        console.error("Ошибка загрузки учебных заведений:", err)
      } finally {
        if (isMounted) setIsFetching(false)
      }
    }

    void fetchData()
    return () => {
      isMounted = false
    }
  }, [selectedRegion, selectedCategory])

  const filteredUniversities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return universities.slice(0, 15)
    return universities
      .filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          (u.shortName?.toLowerCase().includes(q) ?? false)
      )
      .slice(0, 20)
  }, [universities, searchQuery])

  const handleSelect = (name: string) => {
    setSearchQuery(name)
    onChange(name)
    setIsPopoverOpen(false)
  }

  const handleClear = () => {
    setSearchQuery("")
    onChange(null)
  }

  return (
    <Field className="flex flex-col gap-1.5">
      <FieldLabel htmlFor="school" className="flex items-center gap-1.5 text-xs font-semibold">
        <GraduationCap className="size-3.5 text-muted-foreground" />
        Освіта
      </FieldLabel>

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger
          render={
            <div className="relative w-full">
              <Input
                id="school"
                value={searchQuery}
                placeholder="Назва закладу освіти..."
                readOnly
                onClick={() => setIsPopoverOpen(true)}
                className="rounded-xl pr-8 cursor-pointer"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              ) : (
                <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              )}
            </div>
          }
        />

        <PopoverContent className="w-85 sm:w-96 rounded-2xl p-4 shadow-xl space-y-3" align="start">
          <div className="text-s font-semibold font-sans text-foreground">
            Пошук закладу освіти
          </div>

          {/* Фильтры в 2 колонки */}
          <div className="grid grid-cols-2 gap-2 pb-2 border-b border-border/60">
            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Регіон</span>
              <Select
                value={selectedRegion ? String(selectedRegion) : ""}
                onValueChange={(val) => {
                  setSelectedRegion(val ? Number(val) : null)
                }}
              >
                <SelectTrigger className="h-8 w-full rounded-lg text-xs bg-background">
                  <SelectValue placeholder="Регіон">
                    {selectedRegionName || "Регіон"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-48 rounded-xl">
                  <SelectGroup>
                    {REGIONS.map((reg) => (
                      <SelectItem key={reg.code} value={String(reg.code)} className="text-xs">
                        {reg.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Категорія</span>
              <Select
                value={selectedCategory ? String(selectedCategory) : ""}
                onValueChange={(val) => {
                  setSelectedCategory(val ? Number(val) : null)
                }}
              >
                <SelectTrigger className="h-8 w-full rounded-lg text-xs bg-background">
                  <SelectValue placeholder="Категорія">
                    {selectedCategoryName || "Категорія"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="max-h-48 rounded-xl">
                  <SelectGroup>
                    {INSTITUTION_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.code} value={String(cat.code)} className="text-xs">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Поле ввода поиска внутри Поповера */}
          <div className="relative">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Введіть назву або абревіатуру..."
              className="h-9 text-xs rounded-xl pl-8"
              autoFocus
            />
            {isFetching ? (
              <Loader2 className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 animate-spin text-primary" />
            ) : (
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            )}
          </div>

          {/* Результаты поиска */}
          <div className="max-h-44 overflow-y-auto space-y-1 pr-1">
            {filteredUniversities.length > 0 ? (
              filteredUniversities.map((item, index) => (
                <button
                  key={item.id ?? index}
                  type="button"
                  onClick={() => handleSelect(item.name)}
                  className="w-full rounded-lg px-2.5 py-1.5 text-left text-xs font-medium text-foreground hover:bg-accent hover:text-primary transition-colors flex items-center justify-between"
                >
                  <span className="truncate">{item.name}</span>
                  {item.shortName && (
                    <span className="ml-1.5 shrink-0 text-[10px] font-semibold text-muted-foreground">
                      ({item.shortName})
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-muted-foreground">
                {isFetching ? "Завантаження..." : "Закладів не знайдено"}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </Field>
  )
}

const OWNED_PETS = new Set<string>(["Dog", "Cat", "Bird", "Fish", "Reptile", "Amphibian"])
const NONE_OWNED_PETS = new Set<string>(["DontHaveButLove", "NoPets"])
const MAX_SELECTED_PETS = 5

const PET_OPTION_ITEMS = [
  { value: "Dog", title: "Собака" },
  { value: "Cat", title: "Кіт" },
  { value: "Bird", title: "Птах" },
  { value: "Fish", title: "Рибки" },
  { value: "Reptile", title: "Рептилія" },
  { value: "Amphibian", title: "Амфібія" },
  { value: "DontHaveButLove", title: "Не маю, але обожнюю тварин" },
  { value: "WantAPet", title: "Хочу завести улюбленця" },
  { value: "Allergic", title: "Алергія на тварин" },
  { value: "NoPets", title: "Не маю і не планую" },
  { value: "Other", title: "Інше" },
]

function PetsSelectorCard({
  value,
  onChange,
}: {
  value: string[] | null
  onChange: (val: string[] | null) => void
}) {
  const selectedList = value ?? []
  const [customPet, setCustomPet] = useState("")
  const [isOtherPopoverOpen, setIsOtherPopoverOpen] = useState(false)

  const knownValues = PET_OPTION_ITEMS.map((o) => o.value)
  const customValues = selectedList.filter((v) => !knownValues.includes(v))
  const isOtherSelected = customValues.length > 0 || selectedList.includes("Other")

  const hasOwned = selectedList.some((item) => OWNED_PETS.has(item))
  const hasNoneOwned = selectedList.some((item) => NONE_OWNED_PETS.has(item))

  const toggleOption = (optValue: string) => {
    if (selectedList.includes(optValue)) {
      const next = selectedList.filter((item) => item !== optValue)
      onChange(next.length > 0 ? next : null)
      return
    }

    if (selectedList.length >= MAX_SELECTED_PETS) {
      toast.add({
        type: "warning",
        title: "Ліміт досягнуто",
        description: `Можна обрати не більше ${MAX_SELECTED_PETS} варіантів.`,
      })
      return
    }

    let updatedList = [...selectedList]
    if (OWNED_PETS.has(optValue) && hasNoneOwned) {
      updatedList = updatedList.filter((item) => !NONE_OWNED_PETS.has(item))
    } else if (NONE_OWNED_PETS.has(optValue) && hasOwned) {
      updatedList = updatedList.filter((item) => !OWNED_PETS.has(item))
    }

    updatedList.push(optValue)
    onChange(updatedList)
  }

  const handleAddCustomPet = () => {
    const trimmed = customPet.trim()
    if (!trimmed) return

    if (selectedList.length >= MAX_SELECTED_PETS) {
      toast.add({
        type: "warning",
        title: "Ліміт досягнуто",
        description: `Можна обрати не більше ${MAX_SELECTED_PETS} варіантів.`,
      })
      return
    }

    // 1. Прибираємо конфліктний "не маю тварин"
    let updatedList = selectedList.filter((item) => !NONE_OWNED_PETS.has(item))

    // 2. Якщо енум "Other" ще не в масиві — додаємо його для беку
    if (!updatedList.includes("Other")) {
      updatedList.push("Other")
    }

    onChange(updatedList)
    setCustomPet("")
    setIsOtherPopoverOpen(false)
  }

  const formattedLabel = selectedList.length > 0
    ? selectedList.map((p) => PET_OPTIONS[p] ?? p).join(", ")
    : "Не вказано"

  return (
    <div className="rounded-2xl border border-border/60 bg-muted/10 p-3 transition-colors hover:bg-muted/20">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Dog className="size-3.5 text-primary" />
          <span>Домашні тварини</span>
        </div>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
          {selectedList.length} / {MAX_SELECTED_PETS}
        </span>
      </div>

      <Popover>
        <PopoverTrigger
          render={
            <Button
              type="button"
              variant="outline"
              className="w-full justify-between rounded-xl bg-background text-left font-normal h-10 px-3"
            >
              <span className="truncate text-xs font-medium text-foreground">
                {formattedLabel}
              </span>
            </Button>
          }
        />
        <PopoverContent className="w-80 rounded-2xl p-4 shadow-xl" align="start">
          <div className="space-y-3">
            <div className="text-xs font-bold text-foreground">
              Оберіть улюбленців (до 5)
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PET_OPTION_ITEMS.map((opt) => {
                const isOther = opt.value === "Other"
                const isSelected = isOther ? isOtherSelected : selectedList.includes(opt.value)
                const isDisabled =
                  (!isSelected && selectedList.length >= MAX_SELECTED_PETS) ||
                  (OWNED_PETS.has(opt.value) && hasNoneOwned) ||
                  (NONE_OWNED_PETS.has(opt.value) && hasOwned)

                if (isOther) {
                  return (
                    <Popover key={opt.value} open={isOtherPopoverOpen} onOpenChange={setIsOtherPopoverOpen}>
                      <PopoverTrigger
                        render={
                          <button
                            type="button"
                            disabled={isDisabled}
                            className={cn(
                              "flex items-center justify-center rounded-xl border p-2 text-xs font-medium text-center transition-all",
                              isDisabled
                                ? "opacity-40 cursor-not-allowed border-border/50 bg-muted/20"
                                : "cursor-pointer",
                              isSelected && !isDisabled
                                ? "border-primary bg-accent text-primary ring-1 ring-primary/30"
                                : !isDisabled && "border-border bg-card hover:border-primary/60"
                            )}
                          >
                            {opt.title}
                          </button>
                        }
                      />
                      <PopoverContent className="w-64 rounded-xl p-3 shadow-lg">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold">Свій варіант</Label>
                          <div className="flex gap-1.5">
                            <Input
                              value={customPet}
                              onChange={(e) => setCustomPet(e.target.value)}
                              placeholder="Хом'як..."
                              className="h-8 text-xs rounded-lg"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault()
                                  handleAddCustomPet()
                                }
                              }}
                            />
                            <Button size="sm" type="button" onClick={handleAddCustomPet} className="h-8 rounded-lg px-2.5 text-xs">
                              ОК
                            </Button>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                }

                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => toggleOption(opt.value)}
                    className={cn(
                      "flex items-center justify-center rounded-xl border p-2 text-xs font-medium text-center transition-all",
                      isDisabled
                        ? "opacity-40 cursor-not-allowed border-border/50 bg-muted/20"
                        : "cursor-pointer",
                      isSelected && !isDisabled
                        ? "border-primary bg-accent text-primary ring-1 ring-primary/30"
                        : !isDisabled && "border-border bg-card hover:border-primary/60"
                    )}
                  >
                    {opt.title}
                  </button>
                )
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}


interface OptionConfig {
  key: keyof UpdateProfileRequest
  label: string
  optionKey: string
  icon: React.ElementType
}

const relationshipConfigs: OptionConfig[] = [
  { key: "gender", label: "Стать", optionKey: "gender", icon: User },
  { key: "orientation", label: "Орієнтація", optionKey: "orientation", icon: Compass },
  { key: "lookingFor", label: "Ціль знайомства", optionKey: "lookingFor", icon: Heart },
  { key: "loveLanguage", label: "Мова кохання", optionKey: "loveLanguage", icon: Sparkles },
  { key: "familyPlans", label: "Сімейні плани", optionKey: "familyPlans", icon: Users },
]

const lifestyleConfigs: OptionConfig[] = [
  { key: "communication", label: "Стиль спілкування", optionKey: "communication", icon: MessageCircle },
  { key: "workout", label: "Спорт", optionKey: "workout", icon: Dumbbell },
  { key: "drinking", label: "Алкоголь", optionKey: "drinking", icon: Wine },
  { key: "smoking", label: "Куріння", optionKey: "smoking", icon: Cigarette },
  { key: "pets", label: "Домашні тварини", optionKey: "pets", icon: Dog },
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
    city: null,
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
    displayName: profile.displayName ?? "",
    gender: profile.gender ?? "",
    orientation: profile.orientation ?? null,
    bio: profile.bio ?? null,
    occupation: profile.occupation ?? null,
    company: profile.company ?? null,
    school: profile.school ?? null,
    heightCm: profile.heightCm ?? null,
    lookingFor: profile.lookingFor ?? null,
    familyPlans: profile.familyPlans ?? null,
    communication: profile.communication ?? null,
    loveLanguage: profile.loveLanguage ?? null,
    city: profile.city ?? null,
    pets: profile.pets ?? null,
    drinking: profile.drinking ?? null,
    smoking: profile.smoking ?? null,
    workout: profile.workout ?? null,
    instagramHandle: profile.instagramHandle ?? null,
    spotifyHandle: profile.spotifyHandle ?? null,
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

  const [initialState, setInitialState] = useState<{
    form: UpdateProfileRequest
    interestIds: number[]
    languageIds: number[]
    promptAnswers: PromptAnswerInput[]
  } | null>(null)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState<{ fileName: string; progress: number } | null>(null)
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const photoUploadController = useRef<AbortController | null>(null)

  useEffect(() => {
    void Promise.all([getMyProfile(), getLookups()])
      .then(([nextProfile, nextLookups]) => {
        setProfile(nextProfile)
        setLookups(nextLookups)

        const nextForm = formFromProfile(nextProfile)
        const nextInterests = nextProfile.interests.map((item) => item.id)
        const nextLanguages = nextProfile.languages.map((item) => item.id)
        const nextPrompts = [0, 1, 2].map((idx) => {
          const existing = nextProfile.promptAnswers[idx]
          return existing ? { promptId: existing.promptId, answer: existing.answer } : { promptId: 0, answer: "" }
        })

        setForm(nextForm)
        setInterestIds(nextInterests)
        setLanguageIds(nextLanguages)
        setPromptAnswers(nextPrompts)

        setInitialState({
          form: nextForm,
          interestIds: nextInterests,
          languageIds: nextLanguages,
          promptAnswers: nextPrompts,
        })
      })
      .catch((error: unknown) => {
        toast.add({
          type: "error",
          title: "Не вдалося завантажити профіль",
          description: getApiErrorMessage(error, "Спробуйте ще раз."),
        })
      })
      .finally(() => setIsLoading(false))
  }, [])

  const isDirty = useMemo(() => {
    if (!initialState) return false
    const formKeys = Object.keys(form) as Array<keyof UpdateProfileRequest>
    const formChanged = formKeys.some((k) => (form[k] ?? null) !== (initialState.form[k] ?? null))
    if (formChanged) return true

    const sortedCurrentInterests = [...interestIds].sort((a, b) => a - b)
    const sortedInitialInterests = [...initialState.interestIds].sort((a, b) => a - b)
    if (sortedCurrentInterests.length !== sortedInitialInterests.length) return true
    if (sortedCurrentInterests.some((id, idx) => id !== sortedInitialInterests[idx])) return true

    const sortedCurrentLangs = [...languageIds].sort((a, b) => a - b)
    const sortedInitialLangs = [...initialState.languageIds].sort((a, b) => a - b)
    if (sortedCurrentLangs.length !== sortedInitialLangs.length) return true
    if (sortedCurrentLangs.some((id, idx) => id !== sortedInitialLangs[idx])) return true

    for (let i = 0; i < 3; i++) {
      const cur = promptAnswers[i] ?? { promptId: 0, answer: "" }
      const init = initialState.promptAnswers[i] ?? { promptId: 0, answer: "" }
      if (cur.promptId !== init.promptId || cur.answer.trim() !== init.answer.trim()) {
        return true
      }
    }

    return false
  }, [form, interestIds, languageIds, promptAnswers, initialState])

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [isDirty])

  const setHasUnsavedChanges = useUIStore((s) => s.setHasUnsavedChanges)
  useEffect(() => {
    setHasUnsavedChanges(isDirty)
    return () => setHasUnsavedChanges(false)
  }, [isDirty, setHasUnsavedChanges])

  function handleBack() {
    if (isDirty) {
      setShowDiscardDialog(true)
    } else {
      navigate("/me")
    }
  }

  function handleReset() {
    if (!initialState) return
    setForm(initialState.form)
    setInterestIds(initialState.interestIds)
    setLanguageIds(initialState.languageIds)
    setPromptAnswers(initialState.promptAnswers)
    toast.add({ type: "info", title: "Зміни скинуто" })
  }

  function updateField(key: keyof UpdateProfileRequest, value: string) {
    setForm((current) => ({ ...current, [key]: value || null }))
  }

  function toggleInterest(id: number) {
    if (interestIds.includes(id)) {
      setInterestIds(interestIds.filter((item) => item !== id))
    } else if (interestIds.length < 5) {
      setInterestIds([...interestIds, id])
    }
  }

  function toggleLanguage(id: number) {
    if (languageIds.includes(id)) {
      setLanguageIds(languageIds.filter((item) => item !== id))
    } else if (languageIds.length < 10) {
      setLanguageIds([...languageIds, id])
    }
  }

  async function save() {
    if (!form.displayName.trim()) {
      toast.add({
        type: "error",
        title: "Вкажіть ім'я",
        description: "Ім'я користувача не може бути порожнім.",
      })
      return
    }

    setIsSaving(true)
    try {
      await updateMyProfile({
        ...form,
        displayName: form.displayName.trim(),
        heightCm: form.heightCm ? Number(form.heightCm) : null,
      })
      await updateMyInterests(interestIds)
      await updateMyLanguages(languageIds)
      await updateMyPrompts(promptAnswers.filter((item) => item.promptId > 0 && item.answer.trim()))

      const [nextProfile, nextLookups] = await Promise.all([getMyProfile(), getLookups()])
      setProfile(nextProfile)
      setLookups(nextLookups)

      const nextForm = formFromProfile(nextProfile)
      const nextInterests = nextProfile.interests.map((item) => item.id)
      const nextLanguages = nextProfile.languages.map((item) => item.id)
      const nextPrompts = [0, 1, 2].map((idx) => {
        const existing = nextProfile.promptAnswers[idx]
        return existing ? { promptId: existing.promptId, answer: existing.answer } : { promptId: 0, answer: "" }
      })

      setForm(nextForm)
      setInterestIds(nextInterests)
      setLanguageIds(nextLanguages)
      setPromptAnswers(nextPrompts)

      setInitialState({
        form: nextForm,
        interestIds: nextInterests,
        languageIds: nextLanguages,
        promptAnswers: nextPrompts,
      })

      toast.add({ type: "success", title: "Профіль збережено" })
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Не вдалося зберегти профіль",
        description: getApiErrorMessage(error, "Перевірте заповнені поля."),
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function handlePhoto(file: File) {
    if (profile && profile.photos.length >= MAX_PHOTOS) {
      toast.add({
        type: "error",
        title: "Досягнуто ліміту",
        description: `Можна завантажити щонайбільше ${MAX_PHOTOS} фотографій.`,
      })
      return
    }

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
      toast.add({
        type: "error",
        title: "Не вдалося додати фото",
        description: getApiErrorMessage(error, "Перевірте формат (JPEG, PNG, WebP) і розмір файлу."),
      })
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

  async function removePhoto(photoId: string) {
    try {
      await deleteProfilePhoto(photoId)
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Фото видалено" })
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Не вдалося видалити фото",
        description: getApiErrorMessage(error, "Спробуйте ще раз."),
      })
    }
  }

  async function makeMain(photoId: string) {
    try {
      await setMainProfilePhoto(photoId)
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Головне фото оновлено" })
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Не вдалося змінити головне фото",
        description: getApiErrorMessage(error, "Спробуйте ще раз."),
      })
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col px-4 py-6 space-y-6">
        <div>
          <Skeleton className="h-8 w-24 rounded-xl mb-2" />
          <Skeleton className="h-8 w-64 rounded-xl mb-1" />
          <Skeleton className="h-4 w-96 max-w-full rounded-md" />
        </div>
        <Card className="rounded-3xl border-border/70 p-6 space-y-4">
          <Skeleton className="h-6 w-48 rounded-lg" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
            ))}
          </div>
        </Card>
        <Card className="rounded-3xl border-border/70 p-6 space-y-4">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-10 rounded-xl" />
            <Skeleton className="h-28 md:col-span-2 rounded-xl" />
          </div>
        </Card>
      </div>
    )
  }

  if (!profile || !lookups) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-muted-foreground">Профіль недоступний або не вдалося завантажити дані.</p>
        <Button className="mt-4" onClick={() => navigate("/me")}>
          Повернутися назад
        </Button>
      </div>
    )
  }

  const sortedPhotos = [...profile.photos].sort((a, b) => {
    if (a.isMain !== b.isMain) return a.isMain ? -1 : 1
    return a.order - b.order
  })

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-1 flex-col">
      <ScrollArea className="h-full min-h-0 flex-1 px-4">
        <main className="space-y-6 py-6 pb-12">
          {/* Верхня навігація та заголовок */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 size-4" />
              Назад
            </Button>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Редагування профілю
            </h1>
            <p className="text-sm text-muted-foreground">
              Налаштуйте фотографії та розкажіть про себе, щоб знайти людей зі спільним вайбом
            </p>
          </div>

          {/* 1. ФОТОГРАФІЇ */}
          <Card className="rounded-3xl border-border/80 shadow-xs">
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-xl font-semibold font-sans">Фотографії</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Перше фото — головне, його бачать першим у стрічці. Додайте до 6 світлин.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="px-3 py-1 text-xs font-semibold">
                  {profile.photos.length} / {MAX_PHOTOS} завантажено
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {uploadingPhoto && (
                <Attachment state="uploading" className="w-full">
                  <AttachmentMedia>
                    <LoaderCircle className="animate-spin text-primary" />
                  </AttachmentMedia>
                  <AttachmentContent>
                    <AttachmentTitle>{uploadingPhoto.fileName}</AttachmentTitle>
                    <AttachmentDescription>
                      Завантаження фото · {uploadingPhoto.progress}%
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
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
                  const photo = sortedPhotos[index]
                  const isAddSlot = !photo && index === sortedPhotos.length

                  if (photo) {
                    return (
                      <div
                        key={photo.id}
                        className={cn(
                          "group relative aspect-[3/4] overflow-hidden rounded-2xl border bg-muted shadow-xs transition-all",
                          photo.isMain
                            ? "border-primary ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                            : "border-border/70 hover:border-primary/60"
                        )}
                      >
                        <img
                          src={photo.url}
                          alt="Фото профілю"
                          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />

                        {photo.isMain && (
                          <span className="absolute top-2 left-2 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground shadow-sm">
                            <Star className="size-3 fill-current" />
                            Головне
                          </span>
                        )}

                        {photo.isFaceVerified && (
                          <span
                            className="absolute top-2 right-2 rounded-full bg-background/85 p-1 text-primary shadow-xs backdrop-blur-xs"
                            title="Обличчя верифіковано"
                          >
                            <BadgeCheck className="size-4" />
                          </span>
                        )}

                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2 text-white">
                          {!photo.isMain ? (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => void makeMain(photo.id)}
                              className="h-7 px-2 text-[11px] font-medium text-white hover:bg-white/25 hover:text-white"
                            >
                              <Star className="mr-1 size-3" />
                              Головне
                            </Button>
                          ) : (
                            <div />
                          )}

                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            aria-label="Видалити фото"
                            onClick={() => setPhotoToDelete(photo.id)}
                            className="h-7 w-7 text-white/80 hover:bg-destructive hover:text-destructive-foreground transition-colors"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  }

                  if (isAddSlot) {
                    return (
                      <label
                        key={index}
                        className={cn(
                          "flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/5 p-3 text-center transition-all cursor-pointer hover:border-primary hover:bg-primary/10",
                          uploadingPhoto && "pointer-events-none opacity-50"
                        )}
                      >
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary/15 text-primary shadow-xs">
                          <Plus className="size-5" />
                        </div>
                        <span className="text-xs font-semibold text-primary">Додати фото</span>
                        <input
                          className="hidden"
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
                          disabled={!!uploadingPhoto}
                          onChange={(event) => {
                            const file = event.target.files?.[0]
                            event.target.value = ""
                            if (file) void handlePhoto(file)
                          }}
                        />
                      </label>
                    )
                  }

                  return (
                    <div
                      key={index}
                      className="flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 text-muted-foreground/35"
                    >
                      <Plus className="size-6 stroke-[1.5]" />
                      <span className="mt-1 text-[11px]">Фото #{index + 1}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 2. БАЗОВА ІНФОРМАЦІЯ (ПРО ВАС) */}
          <Card className="rounded-3xl border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-xl font-semibold font-sans">Про вас</CardTitle>
              <CardDescription>Основні відомості, які першими читають у вашому профілі</CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="grid gap-5 md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="displayName">
                    Ім&apos;я <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    id="displayName"
                    value={form.displayName ?? ""}
                    onChange={(e) => updateField("displayName", e.target.value)}
                    placeholder="Ваше ім'я або нікнейм"
                    className="rounded-xl"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="heightCm">Зріст, см</FieldLabel>
                  <Input
                    id="heightCm"
                    type="number"
                    min={120}
                    max={250}
                    value={form.heightCm ?? ""}
                    onChange={(e) => {
                      const val = e.target.value
                      if (!val) {
                        setForm((cur) => ({ ...cur, heightCm: null }))
                        return
                      }
                      const num = Number(val)
                      if (num > 250) {
                        setForm((cur) => ({ ...cur, heightCm: 250 }))
                      } else {
                        setForm((cur) => ({ ...cur, heightCm: num }))
                      }
                    }}
                    onBlur={() => {
                      if (form.heightCm !== null && form.heightCm < 120) {
                        setForm((cur) => ({ ...cur, heightCm: 120 }))
                      }
                    }}
                    placeholder="Наприклад, 178"
                    className="rounded-xl"
                  />
                  <FieldDescription>Від 120 до 250 см</FieldDescription>
                </Field>

                <Field className="md:col-span-2">
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="bio">Про себе</FieldLabel>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        (form.bio?.length ?? 0) > 450
                          ? "text-amber-500"
                          : "text-muted-foreground"
                      )}
                    >
                      {form.bio?.length ?? 0} / 500
                    </span>
                  </div>
                  <Textarea
                    id="bio"
                    value={form.bio ?? ""}
                    onChange={(e) => updateField("bio", e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="Розкажіть трохи про свій характер, почуття гумору, що цінуєте в людях або як проводите вільний час..."
                    className="rounded-xl resize-none"
                  />
                  <FieldDescription>
                    Короткий опис допомагає почати розмову природно й невимушено.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor="occupation" className="flex items-center gap-1.5">
                    <Briefcase className="size-3.5 text-muted-foreground" />
                    Заняття / Професія
                  </FieldLabel>
                  <Input
                    id="occupation"
                    value={form.occupation ?? ""}
                    onChange={(e) => updateField("occupation", e.target.value)}
                    placeholder="Дизайнер, Інженер, Фотограф..."
                    className="rounded-xl"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="company" className="flex items-center gap-1.5">
                    <Building2 className="size-3.5 text-muted-foreground" />
                    Компанія / Місце роботи
                  </FieldLabel>
                  <Input
                    id="company"
                    value={form.company ?? ""}
                    onChange={(e) => updateField("company", e.target.value)}
                    placeholder="Назва компанії або стартапу"
                    className="rounded-xl"
                  />
                </Field>

                <SchoolSearchPicker
                  value={form.school}
                  onChange={(val) => setForm((cur) => ({ ...cur, school: val }))}
                />

                <Field>
                  <FieldLabel htmlFor="city" className="flex items-center gap-1.5">
                    Місто
                  </FieldLabel>
                  <Input
                    id="city"
                    value={form.city ?? ""}
                    onChange={(e) => updateField("city", e.target.value)}
                    placeholder="Київ, Львів, Одеса..."
                    className="rounded-xl"
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="instagramHandle" className="flex items-center gap-1.5">
                    <InstagramIcon className="size-3.5 text-pink-500" />
                    Instagram
                  </FieldLabel>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-muted-foreground">
                      @
                    </span>
                    <Input
                      id="instagramHandle"
                      value={form.instagramHandle ?? ""}
                      onChange={(e) => updateField("instagramHandle", e.target.value.replace(/^@/, ""))}
                      placeholder="username"
                      className="pl-7 rounded-xl"
                    />
                  </div>
                </Field>

                <Field>
                  <FieldLabel htmlFor="spotifyHandle" className="flex items-center gap-1.5">
                    <Music className="size-3.5 text-emerald-500" />
                    Spotify
                  </FieldLabel>
                  <Input
                    id="spotifyHandle"
                    value={form.spotifyHandle ?? ""}
                    onChange={(e) => updateField("spotifyHandle", e.target.value)}
                    placeholder="Улюблений артист або посилання"
                    className="rounded-xl"
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* 3. АНКЕТА: СТОСУНКИ ТА СПОСІБ ЖИТТЯ */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="rounded-3xl border-border/80 shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Heart className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold font-sans">Стосунки та цінності</CardTitle>
                    <CardDescription>Що для вас важливо в парі</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {relationshipConfigs.map(({ key, label, optionKey, icon: Icon }) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-border/60 bg-muted/10 p-3 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        <Icon className="size-3.5 text-primary" />
                        <span>{label}</span>
                      </div>
                    </div>

                    <Select
                      value={form[key] ?? ""}
                      onValueChange={(val) =>
                        updateField(key, val === noSelectionValue ? "" : val ?? "")
                      }
                    >
                      <SelectTrigger id={key} className="w-full bg-background rounded-xl">
                        <SelectValue placeholder="Не вказано">
                          {form[key] ? getOptionLabel(optionKey, String(form[key])) : "Не вказано"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-60 rounded-xl">
                        <SelectItem value={noSelectionValue}>Не вказано</SelectItem>
                        {(lookups.options[optionKey] ?? []).map((val) => (
                          <SelectItem key={val} value={val}>
                            {getOptionLabel(optionKey, val)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/80 shadow-xs">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold font-sans">Звички та спосіб життя</CardTitle>
                    <CardDescription>Повсякденні звички та хобі</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {lifestyleConfigs.map(({ key, label, optionKey, icon: Icon }) => {
                  // 🌟 Окрема обробка для улюбленців
                  if (key === "pets") {
                    return (
                      <PetsSelectorCard
                        key={key}
                        value={Array.isArray(form.pets) ? form.pets : form.pets ? String(form.pets).split(",") : null}
                        onChange={(newVal) => setForm((cur) => ({ ...cur, pets: newVal }))}
                      />
                    )
                  }

                  return (
                    <div
                      key={key}
                      className="rounded-2xl border border-border/60 bg-muted/10 p-3 hover:bg-muted/20 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                          <Icon className="size-3.5 text-primary" />
                          <span>{label}</span>
                        </div>
                      </div>

                      <Select
                        value={form[key] ?? ""}
                        onValueChange={(val) =>
                          updateField(key, val === noSelectionValue ? "" : val ?? "")
                        }
                      >
                        <SelectTrigger id={key} className="w-full bg-background rounded-xl">
                          <SelectValue placeholder="Не вказано">
                            {form[key] ? getOptionLabel(optionKey, String(form[key])) : "Не вказано"}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-60 rounded-xl">
                          <SelectItem value={noSelectionValue}>Не вказано</SelectItem>
                          {(lookups.options[optionKey] ?? []).map((val) => (
                            <SelectItem key={val} value={val}>
                              {getOptionLabel(optionKey, val)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* 4. ІНТЕРЕСИ ТА МОВИ */}
          <Card className="rounded-3xl border-border/80 shadow-xs">
            <CardHeader>
              <CardTitle className="text-xl font-semibold font-sans">Інтереси та мови</CardTitle>
              <CardDescription>
                Оберіть захоплення, щоб знаходити людей за спільними темами
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-2">
              <TagPickerCard
                title="Ваші інтереси"
                description="До 5 захоплень"
                limit={5}
                items={lookups.interests}
                selectedIds={interestIds}
                onToggle={toggleInterest}
                icon={Heart}
              />
              <TagPickerCard
                title="Мови спілкування"
                description="До 10 мов"
                limit={10}
                items={lookups.languages}
                selectedIds={languageIds}
                onToggle={toggleLanguage}
                icon={MessageCircle}
              />
            </CardContent>
          </Card>

          {/* 5. ЗАПИТАННЯ ПРО СЕБЕ (PROMPTS) */}
          <Card className="rounded-3xl border-border/80 shadow-xs">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-semibold font-sans">Запитання про себе</CardTitle>
                  <CardDescription>
                    Оберіть до 3 запитань, щоб проявити своє почуття гумору або розповісти цікаву історію
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[0, 1, 2].map((index) => {
                const answer = promptAnswers[index] ?? { promptId: 0, answer: "" }
                const isConfigured = answer.promptId > 0
                const selectedPrompt = lookups.prompts.find((p) => p.id === answer.promptId)
                const selectedPromptText = selectedPrompt
                  ? ((selectedPrompt as any).question ?? (selectedPrompt as any).text ?? selectedPrompt.name)
                  : null

                return (
                  <div
                    key={index}
                    className="rounded-2xl border border-border/80 bg-card p-4 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wide">
                        <MessageCircle className="size-3.5" />
                        Запитання #{index + 1}
                      </span>

                      {(answer.promptId > 0 || answer.answer.trim()) && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPromptAnswers((current) => {
                              const next = [...current]
                              next[index] = { promptId: 0, answer: "" }
                              return next
                            })
                          }}
                          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                        >
                          <RotateCcw className="mr-1 size-3" />
                          Очистити
                        </Button>
                      )}
                    </div>

                    <Select
                      value={answer.promptId ? String(answer.promptId) : "0"}
                      onValueChange={(value) =>
                        setPromptAnswers((current) => {
                          const next = [...current]
                          next[index] = { ...answer, promptId: Number(value ?? 0) }
                          return next
                        })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Оберіть запитання">
                          {answer.promptId && answer.promptId !== 0
                            ? selectedPromptText ?? answer.promptId
                            : "Оберіть запитання"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Оберіть запитання</SelectItem>
                        {lookups.prompts.map((prompt) => (
                          <SelectItem key={prompt.id} value={String(prompt.id)}>
                            {(prompt as any).question ?? (prompt as any).text ?? prompt.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {isConfigured && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>Ваша відповідь:</span>
                          <span
                            className={cn(
                              "font-medium",
                              answer.answer.length > 110
                                ? "text-amber-500"
                                : "text-muted-foreground"
                            )}
                          >
                            {answer.answer.length} / 124
                          </span>
                        </div>
                        <Textarea
                          placeholder="Напишіть щось щире чи дотепне..."
                          maxLength={124}
                          rows={2}
                          value={answer.answer}
                          onChange={(e) => {
                            setPromptAnswers((current) => {
                              const next = [...current]
                              next[index] = { ...answer, answer: e.target.value }
                              return next
                            })
                          }}
                          className="rounded-xl resize-none"
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Посилання на загальні налаштування */}
          <div className="flex justify-end pt-2">
            <Link to="/settings">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Перейти до налаштувань акаунту →
              </Button>
            </Link>
          </div>
        </main>
      </ScrollArea>

      {/* ПЛАВАЮЧИЙ ОСТРІВЕЦЬ ЗБЕРЕЖЕННЯ */}
      <div
        className={cn(
          "fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300 ease-out",
          isDirty
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-8 opacity-0 pointer-events-none"
        )}
      >
        <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-2.5 shadow-xl sm:gap-4">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="hidden sm:inline">Є незбережені зміни</span>
            <span className="sm:hidden">Змінено</span>
          </div>

          <div className="h-4 w-px bg-border" />

          <div className="flex items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              disabled={isSaving}
              className="h-8 rounded-full px-3 text-xs text-muted-foreground hover:text-foreground"
            >
              Скасувати
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => void save()}
              disabled={isSaving || !form.displayName.trim()}
              className="h-8 rounded-full px-4 text-xs font-semibold shadow-xs"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="mr-1.5 size-3.5 animate-spin" />
                  Зберігаємо...
                </>
              ) : (
                <>
                  <Save className="mr-1.5 size-3.5" />
                  Зберегти
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* МОДАЛКА ПІДТВЕРДЖЕННЯ ВИДАЛЕННЯ ФОТО */}
      <AlertDialog
        open={photoToDelete !== null}
        onOpenChange={(open) => !open && setPhotoToDelete(null)}
      >
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Видалити цю фотографію?</AlertDialogTitle>
            <AlertDialogDescription>
              Світлину буде видалено з вашого профілю. Цю дію не можна скасувати.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Скасувати</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (photoToDelete) void removePhoto(photoToDelete)
                setPhotoToDelete(null)
              }}
            >
              Видалити
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* МОДАЛКА ПІДТВЕРДЖЕННЯ ВИХОДУ З НЕЗБЕРЕЖЕНИМИ ДАНИМИ */}
      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="rounded-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Залишити сторінку без збереження?</AlertDialogTitle>
            <AlertDialogDescription>
              У вас є незбережені зміни. Якщо ви вийдете зараз, вони будуть втрачені.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Залишитися</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setShowDiscardDialog(false)
                navigate("/me")
              }}
            >
              Вийти без збереження
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  )
}

function TagPickerCard({
  title,
  description,
  limit,
  items,
  selectedIds,
  onToggle,
  icon: Icon,
}: {
  title: string
  description: string
  limit: number
  items: LookupItem[]
  selectedIds: number[]
  onToggle: (id: number) => void
  icon: React.ElementType
}) {
  const [search, setSearch] = useState("")

  const filteredItems = useMemo(() => {
    if (!search.trim()) return items
    const query = search.toLowerCase()
    return items.filter((item) => item.name.toLowerCase().includes(query))
  }, [items, search])

  const selectedItems = useMemo(() => {
    return items.filter((item) => selectedIds.includes(item.id))
  }, [items, selectedIds])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon className="size-4 text-primary" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <span
          className={cn(
            "text-xs font-semibold px-2 py-0.5 rounded-full",
            selectedIds.length >= limit
              ? "bg-primary/20 text-primary"
              : "bg-muted text-muted-foreground"
          )}
        >
          {selectedIds.length} / {limit}
        </span>
      </div>

      <p className="text-xs text-muted-foreground">{description}</p>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Пошук серед ${items.length} варіантів...`}
          className="h-8 pl-8 pr-7 text-xs rounded-xl"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {selectedItems.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onToggle(item.id)}
              className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground shadow-2xs transition-transform active:scale-95"
            >
              <span>{item.name}</span>
              <X className="size-3 opacity-80 hover:opacity-100" />
            </button>
          ))}
        </div>
      )}

      <div className="flex max-h-56 flex-wrap gap-1.5 overflow-y-auto rounded-2xl border border-border/60 bg-muted/10 p-2.5">
        {filteredItems.length === 0 ? (
          <div className="py-4 text-center text-xs text-muted-foreground w-full">
            Нічого не знайдено
          </div>
        ) : (
          filteredItems.map((item) => {
            const isSelected = selectedIds.includes(item.id)
            const isLimitReached = selectedIds.length >= limit && !isSelected

            return (
              <button
                key={item.id}
                type="button"
                disabled={isLimitReached}
                onClick={() => onToggle(item.id)}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150 flex items-center gap-1",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-xs"
                    : isLimitReached
                      ? "border-border/40 bg-muted/20 text-muted-foreground/40 cursor-not-allowed"
                      : "border-border/80 bg-background text-foreground hover:border-primary/60 hover:bg-accent/40"
                )}
              >
                {isSelected && <Check className="size-3" />}
                <span>{item.name}</span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}