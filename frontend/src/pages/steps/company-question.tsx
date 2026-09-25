import React from "react"
import { Textarea } from "@/components/ui/textarea"
import { TestPage } from "./test-page-layout"

interface Props {
    currentStep: number
    totalSteps: number
    value: string | null
    onChange: (val: string | null) => void
    onNext: () => void
    onBack?: () => void
    isLoading?: boolean
}

const MAX_LENGTH = 80

export default function CompanyStep({
    currentStep,
    totalSteps,
    value,
    onChange,
    onBack,
    onNext,
    isLoading = false,
}: Props) {
    const currentText = value ?? ""
    const charsLeft = MAX_LENGTH - currentText.length

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value
        if (text.length <= MAX_LENGTH) {
            onChange(text.trim() === "" ? null : text)
        }
    }

    return (
        <TestPage
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Розкажіть про свій вид діяльності"
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText={currentText.trim().length === 0 ? "Пропустити" : "Далі"}
        >
            <div className="flex flex-col gap-3">
                <div className="relative">
                    <Textarea
                        value={currentText}
                        onChange={handleChange}
                        placeholder="Розкажіть в якій компанії чи установі Ви працюєте..."
                        rows={5}
                        className="w-full resize-none rounded-xl border border-[#FFD2B2] bg-white p-4 text-[#2A2B2E] placeholder:text-[#6A7178]/60 focus-visible:border-[#FF8A3D] focus-visible:ring-1 focus-visible:ring-[#FF8A3D] shadow-xs"
                    />
                    <div className="mt-1.5 flex justify-end text-xs font-medium text-[#6A7178]">
                        <span>{charsLeft} симв. залишилось</span>
                    </div>
                </div>

                <p className="text-center text-xs text-[#6A7178]">
                    Цей опис допоможе іншим краще вас пізнати. Ви завжди зможете змінити його в налаштуваннях профілю.
                </p>
            </div>
        </TestPage>
    )
}