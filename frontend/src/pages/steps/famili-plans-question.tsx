import { TestPage } from "./test-page-layout"
import { cn } from "@/lib/utils"

export type FamilyPlan =
    | "WantChildren"
    | "DontWantChildren"
    | "HaveChildrenWantMore"
    | "HaveChildrenDontWantMore"
    | "NotSureYet"

interface Option {
    value: FamilyPlan
    title: string
    //   icon: React.ElementType
}

const familyPlanOptions: Option[] = [
    {
        value: "WantChildren",
        title: "Хочу мати дітей",
    },
    {
        value: "DontWantChildren",
        title: "Не хочу мати дітей",
        // icon: Ban,
    },
    {
        value: "HaveChildrenWantMore",
        title: "Маю дітей і хочу більше",
    },
    {
        value: "HaveChildrenDontWantMore",
        title: "Маю дітей і більше не планую",
    },
    {
        value: "NotSureYet",
        title: "Ще не знаю",
    },
]

interface Props {
    currentStep: number
    totalSteps: number
    value: FamilyPlan | string | null
    onChange: (val: FamilyPlan | null) => void
    onNext: () => void
    onBack?: () => void
    isLoading?: boolean
}

export default function FamilyPlansStep({
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
            title="Ваші плани щодо сім'ї та дітей"
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText={!value ? "Пропустити" : "Далі"}
        >
            <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {familyPlanOptions.map((opt) => {
                        const isSelected = value === opt.value

                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onChange(isSelected ? null : opt.value)}
                                className={cn(
                                    "group relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer shadow-xs",
                                    isSelected
                                        ? "border-primary bg-accent ring-2 ring-primary/30"
                                        : "border-border bg-card hover:border-primary/60 hover:bg-accent/40"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                        isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-accent text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                                    )}
                                >
                                </div>

                                <div className="flex flex-col">
                                    <span
                                        className={cn(
                                            "text-sm font-semibold transition-colors",
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