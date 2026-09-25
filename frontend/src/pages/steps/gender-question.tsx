import React from "react"
import { Toggle } from "@/components/ui/toggle"
import { TestPage } from "./test-page-layout.tsx"
import type { Gender } from "@/types/profile"

interface Props {
    currentStep: number
    totalSteps: number
    value: Gender | string
    onChange: (val: Gender) => void
    onNext: () => void
}

const genderOptions: { id: Gender; label: string }[] = [
    { id: "Male", label: "Чоловік" },
    { id: "Female", label: "Жінка" },
    { id: "Other", label: "Інше" },
]

export default function GenderStep({ currentStep, totalSteps, value, onChange, onNext }: Props) {
    return (
        <TestPage
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Який ваш Гендер?"
            canContinue={Boolean(value)}
            onNext={onNext}
        >
            <div className="grid grid-cols-3 gap-3 sm:gap-4 p-2">
                {genderOptions.map((opt) => {
                    const isSelected = value === opt.id
                    return (
                        <Toggle
                            key={opt.id}
                            pressed={isSelected}
                            onPressedChange={() => onChange(opt.id)}
                            className={`aspect-square h-auto w-full min-w-0 rounded-lg bg-white p-0 text-sm font-semibold transition-all select-none sm:text-base ${isSelected
                                ? "scale-[1.02] border-2 border-[#FF8A3D] text-[#FF8A3D] shadow-sm aria-pressed:bg-white"
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