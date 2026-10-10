import React from "react"
import { Toggle } from "@/components/ui/toggle"
import { TestPage } from "./test-page-layout.tsx"
import type { SexualOrientation } from "@/types/profile"

interface Props {
    currentStep: number
    totalSteps: number
    value: string | null
    onChange: (val: SexualOrientation) => void
    onNext: () => void
}

const orientationOptions: { id: SexualOrientation; label: string }[] = [
    { id: "Straight", label: "Гетеросексуал" },
    { id: "Gay", label: "Гомосексуал" },
    { id: "Lesbian", label: "Лесбійка" },
    { id: "Bisexual", label: "Бісексуал" },
    { id: "Asexual", label: "Асексуал" },
    { id: "Demisexual", label: "Демісексуал" },
    { id: "Pansexual", label: "Пансексуал" },
    { id: "Queer", label: "Квір" },
    { id: "Questioning", label: "Не визначений(а)" },
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
                        <Toggle
                            key={opt.id}
                            pressed={isSelected}
                            onPressedChange={() => onChange(opt.id)}
                            className={`h-12 w-full rounded-xl bg-card text-sm font-semibold transition-all ${isSelected
                                ? "border-2 border-primary text-primary shadow-sm aria-pressed:bg-card"
                                : "border border-input text-foreground hover:border-primary/60 hover:bg-card"
                                }`}
                        >
                            {opt.label}
                        </Toggle>
                    )
                })}
            </div>
        </TestPage>
    )
}