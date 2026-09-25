import React from "react"
import { TestPage } from "./test-page-layout"
import { cn } from "@/lib/utils"

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
    value: PetPreference | string | null
    onChange: (val: PetPreference | null) => void
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
    return (
        <TestPage
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Домашні улюбленці"
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText={!value ? "Пропустити" : "Далі"}
        >
            <div className="mx-auto flex w-full max-w-xl flex-col gap-3 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {petOptions.map((opt) => {
                        const isSelected = value === opt.value

                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => onChange(isSelected ? null : opt.value)}
                                className={cn(
                                    "flex items-center justify-center rounded-2xl border p-4 text-center transition-all duration-200 cursor-pointer shadow-xs",
                                    isSelected
                                        ? "border-[#FF8A3D] bg-[#FFF6EE] ring-2 ring-[#FF8A3D]/30"
                                        : "border-[#FFD2B2]/60 bg-white hover:border-[#FF8A3D]/60 hover:bg-[#FFF6EE]/40"
                                )}
                            >
                                <span
                                    className={cn(
                                        "text-sm font-semibold transition-colors",
                                        isSelected ? "text-[#FF8A3D]" : "text-[#2A2B2E]"
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