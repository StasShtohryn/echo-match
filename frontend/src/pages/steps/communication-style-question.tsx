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
                                    "group relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 cursor-pointer shadow-xs",
                                    isSelected
                                        ? "border-[#FF8A3D] bg-[#FFF6EE] ring-2 ring-[#FF8A3D]/30"
                                        : "border-[#FFD2B2]/60 bg-white hover:border-[#FF8A3D]/60 hover:bg-[#FFF6EE]/40"
                                )}
                            >
                                <div
                                    className={cn(
                                        "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                                        isSelected
                                            ? "bg-[#FF8A3D] text-white"
                                            : "bg-[#FFF6EE] text-[#FF8A3D] group-hover:bg-[#FF8A3D] group-hover:text-white"
                                    )}
                                >
                                </div>

                                <div className="flex flex-col">
                                    <span
                                        className={cn(
                                            "text-sm font-semibold transition-colors",
                                            isSelected ? "text-[#FF8A3D]" : "text-[#2A2B2E]"
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