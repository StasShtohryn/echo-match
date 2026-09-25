import { Toggle } from "@/components/ui/toggle"
import { TestPage } from "./test-page-layout.tsx"
import type { RelationshipGoal } from "@/types/profile"

interface Props {
    currentStep: number
    totalSteps: number
    value: string | null
    onChange: (val: RelationshipGoal) => void
    onNext: () => void
    onBack?: () => void
    isLoading: boolean
}

const goalOptions: { id: RelationshipGoal; label: string; }[] = [
    { id: "LongTermPartner", label: "Довготривалі стосунки" },
    { id: "LongTermOpenToShort", label: "Довготривалі стосунки (чи ні...)" },
    { id: "ShortTermOpenToLong", label: "Несерйозні стосунки (чи ні...)" },
    { id: "ShortTermFun", label: "Короткотривалий роман" },
    { id: "NewFriends", label: "Нових друзів" },
    { id: "StillFiguringItOut", label: "Ще точно не знаю" },
]

export default function GoalsStep({
    currentStep,
    totalSteps,
    value,
    onChange,
    onNext,
    onBack,
    isLoading,
}: Props) {
    return (
        <TestPage
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Я шукаю..."
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText="Далі"
        >
            <div className="flex flex-col gap-3">
                {goalOptions.map((opt) => {
                    const isSelected = value === opt.id
                    return (
                        <Toggle
                            key={opt.id}
                            pressed={isSelected}
                            onPressedChange={() => onChange(opt.id)}
                            className={`flex h-14 w-full items-center justify-start gap-4 rounded-xl bg-white px-5 text-left text-sm font-semibold transition-all sm:text-base ${isSelected
                                ? "border-2 border-[#FF8A3D] text-[#FF8A3D] shadow-sm aria-pressed:bg-white"
                                : "border border-[#FFD2B2] text-[#2A2B2E] hover:border-[#FF8A3D]/60 hover:bg-white"
                                }`}
                        >
                            <span>{opt.label}</span>
                        </Toggle>
                    )
                })}
            </div>
        </TestPage>
    )
}