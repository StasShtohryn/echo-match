import React, { useEffect, useMemo, useState } from "react"
import { Search, X, Loader2 } from "lucide-react"
import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { TestPage } from "./test-page-layout"
import { REGIONS, INSTITUTION_CATEGORIES } from "@/data/regions"
import { getUniversities, type UniversityItem } from "@/services/auth-service"

interface Props {
  currentStep: number
  totalSteps: number
  value: string | null
  onChange: (val: string | null) => void
  onNext: () => void
  onBack?: () => void
  isLoading?: boolean
}

export default function SchoolStep({
  currentStep,
  totalSteps,
  value,
  onChange,
  onNext,
  onBack,
  isLoading = false,
}: Props) {
  // Початкові значення — Київ (код 80) та ЗВО (код 1)
  const [selectedRegion, setSelectedRegion] = useState<number | null>(80)
  const [selectedCategory, setSelectedCategory] = useState<number | null>(1)

  const [searchQuery, setSearchQuery] = useState(value ?? "")
  const [universities, setUniversities] = useState<UniversityItem[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  // Запит робиться тільки тоді, коли обидва поля заповнені
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
        if (isMounted) {
          setUniversities(list)
        }
      } catch (err) {
        console.error("Помилка отримання університетів:", err)
      } finally {
        if (isMounted) {
          setIsFetching(false)
        }
      }
    }

    void fetchData()

    return () => {
      isMounted = false
    }
  }, [selectedRegion, selectedCategory])

  // Пошук за назвою серед завантажених даних
  const filteredUniversities = useMemo(() => {
    if (!searchQuery.trim()) return []
    const q = searchQuery.toLowerCase()
    return universities
      .filter((u) => {
        const name = (u.institution_name || u.name || "").toLowerCase()
        return name.includes(q)
      })
      .slice(0, 20)
  }, [universities, searchQuery])

  const handleSelect = (name: string) => {
    setSearchQuery(name)
    onChange(name)
    setIsDropdownOpen(false)
  }

  const handleClear = () => {
    setSearchQuery("")
    onChange(null)
    setIsDropdownOpen(false)
  }

  return (
    <TestPage
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Де ви навчаєтесь або навчалися?"
      canContinue={true}
      onNext={onNext}
      onBack={onBack}
      isLoading={isLoading}
      nextButtonText={!value ? "Пропустити" : "Далі"}
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-5 py-4">

        {/* 1. Вибір регіону (показує назву, віддає числовий код) */}
        <Field className="grid grid-cols-[160px_1fr] items-center gap-3">
          <FieldLabel className="text-sm font-bold text-foreground">
            Регіон
          </FieldLabel>
          <Select
            value={selectedRegion ? String(selectedRegion) : ""}
            onValueChange={(val) => {
              setSelectedRegion(val ? Number(val) : null)
              handleClear()
            }}
          >
            <SelectTrigger className="h-12 w-full rounded-full border border-input bg-card px-5 text-sm font-medium text-foreground shadow-xs focus:ring-2 focus:ring-primary/40">
              <SelectValue placeholder="Оберіть регіон" />
            </SelectTrigger>
            <SelectContent className="max-h-64 rounded-2xl border border-input bg-popover shadow-xl">
              <SelectGroup>
                {REGIONS.map((reg) => (
                  <SelectItem
                    key={reg.code}
                    value={String(reg.code)}
                    className="cursor-pointer py-2 text-sm hover:bg-accent focus:bg-accent focus:text-primary"
                  >
                    {reg.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* 2. Вибір типу закладу */}
        <Field className="grid grid-cols-[160px_1fr] items-center gap-3">
          <FieldLabel className="text-sm font-bold text-foreground">
            Категорія закладу
          </FieldLabel>
          <Select
            value={selectedCategory ? String(selectedCategory) : ""}
            onValueChange={(val) => {
              setSelectedCategory(val ? Number(val) : null)
              handleClear()
            }}
          >
            <SelectTrigger className="h-12 w-full rounded-full border border-input bg-card px-5 text-sm font-medium text-foreground shadow-xs focus:ring-2 focus:ring-primary/40">
              <SelectValue placeholder="Оберіть категорію" />
            </SelectTrigger>
            <SelectContent className="max-h-60 rounded-2xl border border-input bg-popover shadow-xl">
              <SelectGroup>
                {INSTITUTION_CATEGORIES.map((cat) => (
                  <SelectItem
                    key={cat.code}
                    value={String(cat.code)}
                    className="cursor-pointer py-2 text-sm hover:bg-accent focus:bg-accent focus:text-primary"
                  >
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* 3. Пошуковий інпут */}
        <Field className="relative grid grid-cols-[160px_1fr] items-center gap-3">
          <FieldLabel className="text-sm font-bold text-foreground">
            Назва закладу
          </FieldLabel>

          <div className="relative w-full">
            <InputGroup className="h-12 w-full rounded-full border border-input bg-card shadow-xs focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/40">
              <InputGroupAddon className="pl-4 text-primary">
                {isFetching ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <Search className="size-4 text-primary" />
                )}
              </InputGroupAddon>

              <InputGroupInput
                value={searchQuery}
                placeholder={
                  isFetching
                    ? "Завантаження списку..."
                    : selectedRegion && selectedCategory
                      ? "Почніть вводити назву або абревіатуру..."
                      : "Спершу оберіть регіон та категорію"
                }
                disabled={isFetching || !selectedRegion || !selectedCategory}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  onChange(e.target.value || null)
                  setIsDropdownOpen(true)
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="border-none bg-transparent px-3 text-sm font-medium text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0"
              />

              {searchQuery && (
                <InputGroupAddon align="inline-end" className="pr-3">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="cursor-pointer rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-primary transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </InputGroupAddon>
              )}
            </InputGroup>

            {/* Випадаючий список результатів */}
            {isDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-[105%] left-0 z-30 max-h-56 w-full overflow-y-auto rounded-2xl border border-input bg-card p-1.5 shadow-xl">
                {filteredUniversities.length > 0 ? (
                  filteredUniversities.map((item, index) => {
                    const instName = item.institution_name || item.name || ""
                    return (
                      <button
                        key={item.id ?? item.institution_id ?? index}
                        type="button"
                        onClick={() => handleSelect(instName)}
                        className="w-full text-left rounded-xl px-3 py-2 text-xs sm:text-sm text-foreground hover:bg-accent hover:text-primary transition-colors"
                      >
                        {instName}
                      </button>
                    )
                  })
                ) : (
                  <div className="p-3 text-center text-xs text-muted-foreground">
                    {isFetching ? "Пошук закладів..." : "Закладів за цією назвою не знайдено"}
                  </div>
                )}
              </div>
            )}
          </div>
        </Field>

        {/* Підказка */}
        <div className="mt-4 flex flex-col items-center gap-1.5 text-center text-xs text-muted-foreground">
          <p>Введіть частину назви або абревіатуру закладу.</p>
          <p>Пошук здійснюється за обраними вище регіоном та категорією.</p>
          <p className="font-semibold text-primary">
            Оберіть заклад зі списку або залиште поле порожнім і натисніть «Пропустити».
          </p>
        </div>

      </div>
    </TestPage>
  )
}