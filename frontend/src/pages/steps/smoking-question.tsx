import React from "react"
import { TestPage } from "./test-page-layout"
import { cn } from "@/lib/utils"

export type SmokingHabit =
    | "NonSmoker"
    | "SocialSmoker"
    | "SmokerWhenDrinking"
    | "Smoker"
    | "TryingToQuit"

interface Option {
    value: SmokingHabit
    title: string
}

const smokingOptions: Option[] = [
    { value: "NonSmoker", title: "Не курю" },
    { value: "SocialSmoker", title: "Курю в компанії" },
    { value: "SmokerWhenDrinking", title: "Під алкоголь" },
    { value: "Smoker", title: "Регулярно курю" },
    { value: "TryingToQuit", title: "Намагаюся кинути" },
]

interface Props {
    currentStep: number
    totalSteps: number
    value: SmokingHabit | string | null
    onChange: (val: SmokingHabit | null) => void
    onNext: () => void
    onBack?: () => void
    isLoading?: boolean
}

export default function SmokingStep({
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
            title="Ставлення до куріння"
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText={!value ? "Пропустити" : "Далі"}
        >
            <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {smokingOptions.map((opt) => {
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
                                <span
                                    className={cn(
                                        "text-sm font-semibold transition-colors",
                                        isSelected ? "text-primary" : "text-foreground"
                                    )}
                                >
                                    {opt.title}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </TestPage>
    )
}