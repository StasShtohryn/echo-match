import React, { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
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

export default function InterestsStep({
    currentStep,
    totalSteps,
    value,
    onChange,
    onNext,
    onBack,
    isLoading = false,
}: Props) {
    const [availableInterests, setAvailableInterests] = useState<LookupItem[]>([])
    const [isFetching, setIsFetching] = useState(false)
    const [fetchError, setFetchError] = useState<string | null>(null)

    const selectedIds = value ?? []
    const MAX_INTERESTS = 5

    useEffect(() => {
        let isMounted = true

        async function loadData() {
            try {
                setIsFetching(true)
                setFetchError(null)
                const lookups = await getLookups()
                if (isMounted) {
                    setAvailableInterests(lookups.interests ?? [])
                }
            } catch (err) {
                console.error("Не вдалося завантажити довідник інтересів", err)
                if (isMounted) {
                    setFetchError("Не вдалося завантажити список інтересів")
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

    const toggleInterest = (id: number) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter((item) => item !== id))
        } else {
            if (selectedIds.length >= MAX_INTERESTS) {
                return
            }
            onChange([...selectedIds, id])
        }
    }

    return (
        <TestPage
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Що вас цікавить?"
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText={selectedIds.length === 0 ? "Пропустити" : "Далі"}
        >
            <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-4 py-2">
                <p className="text-center text-xs text-muted-foreground">
                    Оберіть від 1 до {MAX_INTERESTS} захоплень
                    {selectedIds.length > 0 && (
                        <span className="ml-1 font-semibold text-primary">
                            ({selectedIds.length} / {MAX_INTERESTS})
                        </span>
                    )}
                </p>

                {isFetching ? (
                    <div className="flex h-44 w-full items-center justify-center">
                        <Loader2 className="size-8 animate-spin text-primary" />
                    </div>
                ) : fetchError ? (
                    <div className="p-4 text-center text-xs text-destructive">
                        {fetchError}
                    </div>
                ) : (
                    <div className="flex flex-wrap justify-center gap-2.5 pt-2">
                        {availableInterests.map((interest) => {
                            const isSelected = selectedIds.includes(interest.id)
                            const isLimitReached = selectedIds.length >= MAX_INTERESTS && !isSelected
                            return (
                                <button
                                    key={interest.id}
                                    type="button"
                                    disabled={isLimitReached}
                                    onClick={() => toggleInterest(interest.id)}
                                    className={cn(
                                        "cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 shadow-xs",
                                        isSelected
                                            ? "border-primary bg-accent text-primary ring-2 ring-primary/30"
                                            : "border-border bg-card text-foreground hover:border-primary/70 hover:bg-accent/40"
                                    )}
                                >
                                    {interest.name}
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>
        </TestPage>
    )
}