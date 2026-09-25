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
    onBack?: () => void
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
    onBack,
}: Props) {
    return (
        <TestPage
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Моя сексуальна орієнтація"
            canContinue={Boolean(value)}
            onNext={onNext}
            onBack={onBack}
        >
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {orientationOptions.map((opt) => {
                    const isSelected = value === opt.id
                    return (
                        <Toggle
                            key={opt.id}
                            pressed={isSelected}
                            onPressedChange={() => onChange(opt.id)}
                            className={`h-12 w-full rounded-xl bg-white text-sm font-semibold transition-all ${isSelected
                                ? "border-2 border-[#FF8A3D] text-[#FF8A3D] shadow-sm aria-pressed:bg-white"
                                : "border border-[#FFD2B2] text-[#2A2B2E] hover:border-[#FF8A3D]/60 hover:bg-white"
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