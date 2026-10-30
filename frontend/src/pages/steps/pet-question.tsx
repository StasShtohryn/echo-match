import React, { useState } from "react"
import { TestPage } from "./test-page-layout"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { toast } from "@/components/ui/toast"

export type PetPreference =
  | "Dog"
  | "Cat"
  | "Reptile"
  | "Amphibian"
  | "Bird"
  | "Fish"
  | "DontHaveButLove"
  | "Allergic"
  | "NoPets"
  | "WantAPet"
  | "Other"

const OWNED_PETS = new Set<string>([
  "Dog",
  "Cat",
  "Bird",
  "Fish",
  "Reptile",
  "Amphibian",
])

const NONE_OWNED_PETS = new Set<string>([
  "DontHaveButLove",
  "NoPets",
])

const MAX_SELECTED_PETS = 5

interface Option {
  value: PetPreference
  title: string
}

const petOptions: Option[] = [
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

interface Props {
  currentStep: number
  totalSteps: number
  value: string[] | null
  onChange: (val: string[] | null) => void
  onNext: () => void
  onBack?: () => void
  isLoading?: boolean
}

export default function PetsStep({
  currentStep,
  totalSteps,
  value,
  onChange,
  onNext,
  onBack,
  isLoading = false,
}: Props) {
  const selectedList = value ?? []
  const [customPet, setCustomPet] = useState("")
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  // Перевіряємо, чи є в масиві кастомні значення (ті, яких немає серед системних ключових слів)
  const knownValues = petOptions.map((o) => o.value)
  const customValues = selectedList.filter((v) => !knownValues.includes(v as PetPreference))
  const isOtherSelected = customValues.length > 0 || selectedList.includes("Other")

  // Перевіряємо, які групи зараз присутні серед обраних
  const hasOwned = selectedList.some((item) => OWNED_PETS.has(item))
  const hasNoneOwned = selectedList.some((item) => NONE_OWNED_PETS.has(item))

  const toggleOption = (optValue: string) => {
    // 1. Якщо елемент вже обраний — знімаємо його
    if (selectedList.includes(optValue)) {
      const next = selectedList.filter((item) => item !== optValue)
      onChange(next.length > 0 ? next : null)
      return
    }

    // 2. Перевірка ліміту 5 елементів
    if (selectedList.length >= MAX_SELECTED_PETS) {
      toast.add({
        type: "warning",
        title: "Ліміт досягнуто",
        description: `Можна обрати не більше ${MAX_SELECTED_PETS} варіантів.`,
      })
      return
    }

    // 3. Автоматичне очищення конфліктних варіантів
    let updatedList = [...selectedList]

    if (OWNED_PETS.has(optValue) && hasNoneOwned) {
      // Якщо обираємо тварину, що є — скидаємо «не маю тварин»
      updatedList = updatedList.filter((item) => !NONE_OWNED_PETS.has(item))
      toast.add({
        type: "info",
        title: "Варіанти оновлено",
        description: "Варіант «Не маю тварин» скасовано, оскільки ви обрали наявного улюбленця.",
      })
    } else if (NONE_OWNED_PETS.has(optValue) && hasOwned) {
      // Якщо обираємо «не маю тварин» — скидаємо наявних тварин
      updatedList = updatedList.filter((item) => !OWNED_PETS.has(item))
      toast.add({
        type: "info",
        title: "Варіанти оновлено",
        description: "Наявні тварини скасовані, оскільки ви обрали варіант «Не маю тварин».",
      })
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
    setIsPopoverOpen(false)
  }

  const handleRemoveCustomPet = (petToRemove: string) => {
    const next = selectedList.filter((item) => item !== petToRemove)
    onChange(next.length > 0 ? next : null)
  }

  return (
    <TestPage
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Домашні улюбленці"
      canContinue={true}
      onNext={onNext}
      onBack={onBack}
      isLoading={isLoading}
      nextButtonText={selectedList.length === 0 ? "Пропустити" : "Далі"}
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 py-4 text-sm transition-all">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-sans text-muted-foreground">
            Обрані улюбленці
          </span>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors",
              selectedList.length >= MAX_SELECTED_PETS
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : selectedList.length > 0
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {selectedList.length} / {MAX_SELECTED_PETS}
          </span>
        </div>
        <div className="text-sm transition-all sm:text-base font-sans grid grid-cols-1 sm:grid-cols-2 gap-3">
          {petOptions.map((opt) => {
            const isOther = opt.value === "Other"
            const isSelected = isOther ? isOtherSelected : selectedList.includes(opt.value)

            // Блокування конфліктних кнопок у UI
            const isDisabled =
              (!isSelected && selectedList.length >= MAX_SELECTED_PETS) ||
              (OWNED_PETS.has(opt.value) && hasNoneOwned) ||
              (NONE_OWNED_PETS.has(opt.value) && hasOwned)

            if (isOther) {
              return (
                <Popover key={opt.value} open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        disabled={isDisabled}
                        className={cn(
                          "flex items-center justify-center rounded-2xl border p-4 text-sm transition-all sm:text-base font-sans text-center duration-200 shadow-xs",
                          isDisabled
                            ? "opacity-40 cursor-not-allowed border-border/50 bg-muted/20"
                            : "cursor-pointer",
                          isSelected && !isDisabled
                            ? "border-primary bg-accent ring-2 ring-primary/30"
                            : !isDisabled && "border-border bg-card hover:border-primary/60 hover:bg-accent/40"
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm sm:text-base font-sans transition-colors",
                            isSelected ? "text-primary" : "text-foreground"
                          )}
                        >
                          {opt.title}
                        </span>
                      </button>
                    }
                  />
                  < PopoverContent className="w-80 rounded-2xl p-4 shadow-xl" >
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="custom-pet" className="text-xs font-bold text-foreground">
                          Ваш варіант улюбленця
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Вкажіть, який саме улюбленець у вас є
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <Input
                          id="custom-pet"
                          value={customPet}
                          onChange={(e) => setCustomPet(e.target.value)}
                          placeholder="Наприклад: Хом'як, Тхорик..."
                          className="h-9 text-xs rounded-xl"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault()
                              handleAddCustomPet()
                            }
                          }}
                        />
                        <Button size="sm" type="button" onClick={handleAddCustomPet} className="h-9 rounded-xl px-3 text-xs">
                          Додати
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
                  "flex items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 shadow-xs",
                  isDisabled
                    ? "opacity-40 cursor-not-allowed border-border/50 bg-muted/20"
                    : "cursor-pointer",
                  isSelected && !isDisabled
                    ? "border-primary bg-accent ring-2 ring-primary/30"
                    : !isDisabled && "border-border bg-card hover:border-primary/60 hover:bg-accent/40"
                )}
              >
                <span
                  className={cn(
                    "text-sm sm:text-base font-sans transition-colors",
                    isSelected ? "text-primary" : "text-foreground"
                  )}
                >
                  {opt.title}
                </span>
              </button>
            )
          })}
        </div>

        {/* Відображення доданих кастомних улюбленців */}
        {
          customValues.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="text-xs font-semibold text-muted-foreground w-full">Додані варіанти:</span>
              {customValues.map((customName) => (
                <span
                  key={customName}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {customName}
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomPet(customName)}
                    className="hover:text-destructive transition-colors cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )
        }
      </div >
    </TestPage >
  )
}