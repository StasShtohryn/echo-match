import { Toggle } from "@/components/ui/toggle"
import { TestPage } from "./test-page-layout.tsx"
import type { SexualOrientation } from "@/types/profile"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"


interface Props {
  currentStep: number
  totalSteps: number
  value: string | null
  onChange: (val: SexualOrientation) => void
  onNext: () => void
}

const orientationOptions: { id: SexualOrientation; label: string; description: string }[] = [
  {
    id: "Straight",
    label: "Гетеросексуал",
    description: "Відчуває потяг до людей протилежної статі.",
  },
  {
    id: "Gay",
    label: "Гомосексуал",
    description: "Відчуває потяг до людей своєї статі (зазвичай чоловіків).",
  },
  {
    id: "Lesbian",
    label: "Лесбійка",
    description: "Жінка, яка відчуває потяг до жінок.",
  },
  {
    id: "Bisexual",
    label: "Бісексуал",
    description: "Відчуває потяг як до своєї, так і до інших статей.",
  },
  {
    id: "Asexual",
    label: "Асексуал",
    description: "Відчуває слабкий сексуальний потяг або взагалі його не має.",
  },
  {
    id: "Demisexual",
    label: "Демісексуал",
    description: "Відчуває сексуальний потяг лише після встановлення глибокого емоційного зв'язку.",
  },
  {
    id: "Pansexual",
    label: "Пансексуал",
    description: "Відчуває потяг до людей незалежно від їхньої гендерної ідентичності.",
  },
  {
    id: "Queer",
    label: "Квір",
    description: "Парасольковий термін для людей, чий гендер чи орієнтація відрізняється від загальноприйнятих норм.",
  },
  {
    id: "Questioning",
    label: "Не визначений(а)",
    description: "Перебуває у процесі дослідження та розуміння власної орієнтації.",
  },
]

export default function OrientationStep({
  currentStep,
  totalSteps,
  value,
  onChange,
  onNext,
}: Props) {
  return (
    <TestPage
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Моя сексуальна орієнтація"
      canContinue={Boolean(value)}
      onNext={onNext}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {orientationOptions.map((opt) => {
          const isSelected = value === opt.id
          return (
            <HoverCard key={opt.id}>
              <HoverCardTrigger
                delay={100}
                closeDelay={100}
                render={
                  <div className="w-full">
                    <Toggle
                      pressed={isSelected}
                      onPressedChange={() => onChange(opt.id)}
                      className={`h-12 w-full rounded-xl bg-card text-sm font-semibold transition-all cursor-pointer ${isSelected
                        ? "border-2 border-primary text-primary shadow-sm aria-pressed:bg-card"
                        : "border border-input text-foreground hover:border-primary/60 hover:bg-card"
                        }`}
                    >
                      {opt.label}
                    </Toggle>
                  </div>
                }
              />
              <HoverCardContent
                side="top"
                className="w-60 text-xs shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="font-semibold text-foreground mb-1">{opt.label}</div>
                <div className="text-muted-foreground leading-relaxed">
                  {opt.description}
                </div>
              </HoverCardContent>
            </HoverCard>
          )
        })}
      </div>
    </TestPage>
  )
}