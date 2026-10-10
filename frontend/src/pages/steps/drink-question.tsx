import React from "react"
import { TestPage } from "./test-page-layout"
import { cn } from "@/lib/utils"

export type DrinkingHabit =
    | "NotForMe"
    | "SoberCurious"
    | "OnSpecialOccasions"
    | "SociallyOnWeekends"
    | "MostNights"

interface Option {
    value: DrinkingHabit
    title: string
}

const drinkingOptions: Option[] = [
    { value: "NotForMe", title: "Не для мене" },
    { value: "SoberCurious", title: "Намагаюся не пити" },
    { value: "OnSpecialOccasions", title: "П'ю з особливої нагоди" },
    { value: "SociallyOnWeekends", title: "П'ю в компанії на вихідних" },
    { value: "MostNights", title: "Майже кожного вечора" },
]

interface Props {
    currentStep: number
    totalSteps: number
    value: DrinkingHabit | string | null
    onChange: (val: DrinkingHabit | null) => void
    onNext: () => void
    onBack?: () => void
    isLoading?: boolean
}

export default function DrinkingStep({
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
            title="Ставлення до алкоголю"
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText={!value ? "Пропустити" : "Далі"}
        >
            <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {drinkingOptions.map((opt) => {
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