import { FilterPanel } from "@/components/filter-panel"
import type { DiscoveryPreferences, UpdatePreferencesRequest } from "@/services/auth-service"
import { TestPage } from "./test-page-layout"


interface Props {
    currentStep: number
    totalSteps: number
    value: UpdatePreferencesRequest | null
    onChange: (val: UpdatePreferencesRequest) => void
    onNext: () => void
    onBack?: () => void
    isLoading?: boolean
}

const defaultPreferences: UpdatePreferencesRequest = {
    showMe: "Women",
    minAge: 18,
    maxAge: 50,
    maxDistanceKm: 50,
}

export default function FilterStep({
    currentStep,
    totalSteps,
    value,
    onChange,
    onNext,
    onBack,
    isLoading = false,
}: Props) {
    const currentPreferences = value ?? defaultPreferences
    return (
        <TestPage
            currentStep={currentStep}
            totalSteps={totalSteps}
            title="Кого ви шукаєте?"
            canContinue={true}
            onNext={onNext}
            onBack={onBack}
            isLoading={isLoading}
            nextButtonText="Далі"
        >
            <div className="mx-auto flex w-full max-w-md flex-col py-2">
                <FilterPanel
                    initialPreferences={currentPreferences as any}
                    isSaving={false}
                    // Коли в панелі змінюються фільтри, одразу оновлюємо стан візарда
                    onApply={(updated) => onChange(updated)}
                // Можна додати пропс hideButton, щоб не дублювати кнопку збереження в панелі
                />
            </div>
        </TestPage>
    )
}