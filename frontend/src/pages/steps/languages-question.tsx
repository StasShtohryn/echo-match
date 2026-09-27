import React, { useEffect, useState } from "react"
import { Loader2, Globe } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TestPage } from "./test-page-layout"
import { getLookups, type LookupItem } from "@/services/auth-service"
import { cn } from "@/lib/utils"

interface Props {
    currentStep: number
    totalSteps: number
    value: number[] | null
    onChange: (val: number[]) => void
    onNext: () => void
    onBack?: () => void
    isLoading?: boolean
}

export default function LanguagesStep({
    currentStep,
    totalSteps,
    value,
    onChange,
    onNext,
    onBack,
    isLoading = false,
}: Props) {
    const [languagesList, setLanguagesList] = useState<LookupItem[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const selectedIds = value ?? []

    useEffect(() => {
        let isMounted = true

        async function loadData() {
            try {
                setIsFetching(true)
                setFetchError(null)
                const lookups = await getLookups()
                if (isMounted) {
                    setLanguagesList(lookups.languages ?? [])
                }
            } catch (err) {
                console.error("Не вдалося завантажити мови:", err)
                if (isMounted) {
                    setFetchError("Не вдалося завантажити список мов")
                }
            } finally {
                if (isMounted) {
                    setIsFetching(false)
                }
            }
        }

        void loadData()

        return () => {
            isMounted = false
        }
    }, [])

    const handleToggle = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((item) => item !== id))
        } else {
            onChange([...selectedIds, id])
        }
    }

    return (
        <TestPage
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Якими мовами ви володієте?"
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText={selectedIds.length === 0 ? "Пропустити" : "Далі"}
        >
            <div className="mx-auto flex w-full max-w-xl flex-col gap-4 py-3">
                <div className="flex items-center justify-between px-1 text-xs text-[#6A7178]">
                    <span>Оберіть усі мови, які знаєте</span>
                    {selectedIds.length > 0 && (
                        <span className="font-semibold text-[#FF8A3D]">
                            Обрано: {selectedIds.length}
                        </span>
                    )}
                </div>

                {isFetching ? (
                    <div className="flex h-44 w-full items-center justify-center">
                        <Loader2 className="size-8 animate-spin text-[#FF8A3D]" />
                    </div>
                ) : fetchError ? (
                    <div className="p-4 text-center text-xs text-destructive">
                        {fetchError}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {languagesList.map((lang) => {
                            const isChecked = selectedIds.includes(lang.id)
                            const switchId = `lang-switch-${lang.id}`

                            return (
                                <div
                                    key={lang.id}
                                    onClick={() => handleToggle(lang.id)}
                                    className={cn(
                                        "flex items-center justify-between rounded-2xl border p-3.5 transition-all duration-200 cursor-pointer shadow-xs",
                                        isChecked
                                            ? "border-[#FF8A3D] bg-[#FFF6EE] ring-1 ring-[#FF8A3D]/40"
                                            : "border-[#FFD2B2]/60 bg-white hover:border-[#FF8A3D]/60 hover:bg-[#FFF6EE]/30"
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={cn(
                                                "flex size-9 items-center justify-center rounded-xl transition-colors",
                                                isChecked
                                                    ? "bg-[#FF8A3D] text-white"
                                                    : "bg-[#FFF6EE] text-[#FF8A3D]"
                                            )}
                                        >
                                            <Globe className="size-4" />
                                        </div>

                                        <Label
                                            htmlFor={switchId}
                                            className={cn(
                                                "cursor-pointer text-sm font-semibold transition-colors",
                                                isChecked ? "text-[#FF8A3D]" : "text-[#2A2B2E]"
                                            )}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {lang.name}
                                        </Label>
                                    </div>

                                    <div onClick={(e) => e.stopPropagation()}>
                                        <Switch
                                            id={switchId}
                                            checked={isChecked}
                                            onCheckedChange={() => handleToggle(lang.id)}
                                            className="data-[state=checked]:bg-[#FF8A3D]"
                                        />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </TestPage>
    )
}