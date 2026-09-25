import React from "react"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { Dumbbell, Flame, Sparkles, Coffee } from "lucide-react"
import { TestPage } from "./test-page-layout"
import { cn } from "@/lib/utils"

export type WorkoutHabit = "Everyday" | "Often" | "Sometimes" | "Never"

export interface LifestyleValue {
    heightCm: number | null
    workout: WorkoutHabit | string | null
}

interface WorkoutOption {
    value: WorkoutHabit
    title: string
    description: string
    icon: React.ElementType
}

const workoutOptions: WorkoutOption[] = [
    {
        value: "Everyday",
        title: "Щодня",
        description: "Спорт — це стиль мого життя",
        icon: Flame,
    },
    {
        value: "Often",
        title: "Часто",
        description: "Кілька разів на тиждень",
        icon: Dumbbell,
    },
    {
        value: "Sometimes",
        title: "Іноді",
        description: "Під настрій або за компанію",
        icon: Sparkles,
    },
    {
        value: "Never",
        title: "Майже ніколи",
        description: "Віддаю перевагу іншим справам",
        icon: Coffee,
    },
]

interface Props {
    currentStep: number
    totalSteps: number
    value: LifestyleValue
    onChange: (val: LifestyleValue) => void
    onNext: () => void
    onBack?: () => void
    isLoading?: boolean
}

export default function LifestyleStep({
    currentStep,
    totalSteps,
    value,
    onChange,
    onNext,
    onBack,
    isLoading = false,
}: Props) {
    const heightVal = value?.heightCm ?? null
    const workoutVal = value?.workout ?? null
    const otpString = heightVal ? String(heightVal) : ""

    const handleHeightChange = (val: string) => {
        if (!val) {
            onChange({ ...value, heightCm: null })
        } else {
            const num = Number(val)
            onChange({ ...value, heightCm: Number.isNaN(num) ? null : num })
        }
    }

    const handleWorkoutChange = (optValue: WorkoutHabit) => {
        const nextWorkout = workoutVal === optValue ? null : optValue
        onChange({ ...value, workout: nextWorkout })
    }

    return (
        <TestPage
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Зріст та активність"
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText={!heightVal && !workoutVal ? "Пропустити" : "Далі"}
        >
            <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-7 py-3">
                {/* Поле 1: Зріст */}
                <Field className="flex flex-col items-center gap-2">
                    <FieldLabel htmlFor="height-otp" className="text-sm font-bold text-[#1E293B]">
                        Ваш зріст
                    </FieldLabel>

                    <div className="flex items-center gap-3">
                        <InputOTP
                            id="height-otp"
                            maxLength={3}
                            value={otpString}
                            onChange={handleHeightChange}
                            pattern={REGEXP_ONLY_DIGITS}
                            className="gap-2"
                        >
                            <InputOTPGroup className="gap-2">
                                <InputOTPSlot
                                    index={0}
                                    className="size-12 rounded-xl border border-[#FFD2B2] bg-white text-lg font-bold text-[#2A2B2E] shadow-xs focus:border-[#FF8A3D] focus:ring-2 focus:ring-[#FF8A3D]/40"
                                />
                                <InputOTPSlot
                                    index={1}
                                    className="size-12 rounded-xl border border-[#FFD2B2] bg-white text-lg font-bold text-[#2A2B2E] shadow-xs focus:border-[#FF8A3D] focus:ring-2 focus:ring-[#FF8A3D]/40"
                                />
                                <InputOTPSlot
                                    index={2}
                                    className="size-12 rounded-xl border border-[#FFD2B2] bg-white text-lg font-bold text-[#2A2B2E] shadow-xs focus:border-[#FF8A3D] focus:ring-2 focus:ring-[#FF8A3D]/40"
                                />
                            </InputOTPGroup>
                        </InputOTP>
                        <span className="text-sm font-semibold text-[#6A7178]">см</span>
                    </div>

                    <FieldDescription className="text-center text-xs text-[#6A7178]">
                        Введіть 3 цифри (наприклад, 175)
                    </FieldDescription>
                </Field>

                {/* Поле 2: Спорт / Тренування */}
                <div className="flex w-full flex-col gap-3">
                    <div className="text-center">
                        <h4 className="text-sm font-bold text-[#1E293B]">
                            Як часто ви тренуєтесь?
                        </h4>
                        <p className="text-xs text-[#6A7178]">
                            Оберіть звичку, яка найкраще вам підходить
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {workoutOptions.map((opt) => {
                            const Icon = opt.icon
                            const isSelected = workoutVal === opt.value

                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => handleWorkoutChange(opt.value)}
                                    className={cn(
                                        "group relative flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all duration-200 cursor-pointer shadow-xs",
                                        isSelected
                                            ? "border-[#FF8A3D] bg-[#FFF6EE] ring-2 ring-[#FF8A3D]/30"
                                            : "border-[#FFD2B2]/60 bg-white hover:border-[#FF8A3D]/60 hover:bg-[#FFF6EE]/40"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                                            isSelected
                                                ? "bg-[#FF8A3D] text-white"
                                                : "bg-[#FFF6EE] text-[#FF8A3D] group-hover:bg-[#FF8A3D] group-hover:text-white"
                                        )}
                                    >
                                        <Icon className="size-5" />
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
                                        <span className="text-xs text-[#6A7178]">
                                            {opt.description}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </TestPage>
    )
}