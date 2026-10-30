import { TestPage } from "./test-page-layout"
import { cn } from "@/lib/utils"

export type CommunicationStyle =
  | "BigTimeTexter"
  | "PhoneCaller"
  | "VideoChatter"
  | "BadTexter"
  | "BetterInPerson"

interface Option {
  value: CommunicationStyle
  title: string
}

const communicationOptions: Option[] = [
  {
    value: "BigTimeTexter",
    title: "Багато переписуюсь",
  },
  {
    value: "PhoneCaller",
    title: "Краще по телефону",
  },
  {
    value: "VideoChatter",
    title: "У відеочаті",
  },
  {
    value: "BadTexter",
    title: "Рідко переписуюсь",
  },
  {
    value: "BetterInPerson",
    title: "Краще зустрітись особисто",
  },
]

interface Props {
  currentStep: number
  totalSteps: number
  value: CommunicationStyle | string | null
  onChange: (val: CommunicationStyle | null) => void
  onNext: () => void
  onBack?: () => void
  isLoading?: boolean
}

export default function CommunicationStep({
  currentStep,
  totalSteps,
  value,
  onChange,
  onNext,
  onBack,
  isLoading = false,
}: Props) {
  return (
    <TestPage
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Ваш стиль спілкування"
      canContinue={true}
      onNext={onNext}
      onBack={onBack}
      isLoading={isLoading}
      nextButtonText={!value ? "Пропустити" : "Далі"}
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {communicationOptions.map((opt) => {
            const isSelected = value === opt.value

            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange(isSelected ? null : opt.value)}
                className={cn(
                  "flex items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 cursor-pointer shadow-xs",
                  isSelected
                    ? "border-primary bg-accent ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/60 hover:bg-accent/40"
                )}
              >

                <div className="flex flex-col">
                  <span
                    className={cn(
                      "text-sm transition-all sm:text-base font-sans",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {opt.title}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </TestPage>
  )
}