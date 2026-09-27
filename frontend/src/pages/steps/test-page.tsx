import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import { getMyProfile, updateMyInterests, updateMyLanguages, updateMyProfile, updateMyPrompts } from "@/services/auth-service"
import type { PromptAnswerInput, UpdateProfileRequest } from "@/services/auth-service"
import { useAuthStore } from "@/store/useAuthStore"

import OrientationStep from "./orientation-question"
import GoalsStep from "./goal-question"
import BioStep from "./bio-question"
import OccupationStep from "./occupation-question"
import SchoolStep from "./school-question"
import CompanyStep from "./company-question"
import LifestyleStep, { type LifestyleValue } from "./lifestyle-question"
import FamilyPlansStep from "./famili-plans-question"
import CommunicationStep from "./communication-style-question"
import LoveLanguageStep from "./love-language-step"
import PetsStep from "./pet-question"
import DrinkingStep from "./drink-question"
import SmokingStep from "./smoking-question"
import InterestsStep from "./interests-question"
import PromptsStep from "./prompts-question"
import LanguagesStep from "./languages-question"
import { updateMyPreferences, type UpdatePreferencesRequest } from "@/services/auth-service"
import FilterStep from "./filters-question"


const stepsConfig = [
    {
        field: "orientation" as const,
        component: OrientationStep,
    },
    {
        field: "lookingFor" as const,
        component: GoalsStep,
    },
    {
        field: "preferences" as const,
        component: FilterStep
    },
    {
        field: "bio" as const,
        component: BioStep,
    },
    {
        field: "communication" as const,
        component: CommunicationStep
    },
    {
        field: "loveLanguage" as const,
        component: LoveLanguageStep
    },
    {
        field: "school" as const,
        component: SchoolStep,
    },
    {
        field: "occupation" as const,
        component: OccupationStep,
    },

    {
        field: "company" as const,
        component: CompanyStep,
    },
    {
        field: "familyPlans" as const,
        component: FamilyPlansStep
    },
    {
        field: "pets" as const,
        component: PetsStep
    },
    {
        field: "lifestyle" as const,
        component: LifestyleStep
    },

    {
        field: "interests" as const,
        component: InterestsStep
    },
    {
        field: "drinking" as const,
        component: DrinkingStep
    },
    {
        field: "smoking" as const,
        component: SmokingStep
    },

    {
        field: "languages" as const,
        component: LanguagesStep
    },

    {
        field: "prompts" as const,
        component: PromptsStep
    },
]


export default function TestsPage() {
    const navigate = useNavigate()
    const user = useAuthStore((state) => state.user)

    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)

    const totalSteps = stepsConfig.length
    const isFirstStep = currentStep === 1
    const isLastStep = currentStep === totalSteps

    useEffect(() => {
        let isMounted = true

        async function loadCurrentProfile() {
            try {
                const current = await getMyProfile()
                if (isMounted && current) {
                    setProfileData((prev) => ({
                        ...prev,
                        gender: current.gender ?? prev.gender,
                    }))
                }
            } catch (err) {
                console.error("Не вдалося завантажити профіль:", err)
            }
        }

        void loadCurrentProfile()

        return () => {
            isMounted = false
        }
    }, [])

    const [profileData, setProfileData] = useState<UpdateProfileRequest>({
        displayName: user?.name ?? "User",
        gender: (user as any)?.gender ?? "",
        orientation: null,
        bio: null,
        city: null,
        occupation: null,
        company: null,
        school: null,
        heightCm: null,
        lookingFor: null,
        familyPlans: null,
        communication: null,
        loveLanguage: null,
        pets: null,
        drinking: null,
        smoking: null,
        workout: null,
        instagramHandle: null,
        spotifyHandle: null,
    })

    const updateField = <K extends keyof UpdateProfileRequest>(
        field: K,
        val: UpdateProfileRequest[K]
    ) => {
        setProfileData((prev) => ({ ...prev, [field]: val }))
    }

    const nextStep = () => setCurrentStep((prev) => prev + 1)
    const prevStep = () => setCurrentStep((prev) => prev - 1)

    const currentStepConfig = stepsConfig[currentStep - 1]
    const StepComponent = currentStepConfig.component

    const [selectedInterestIds, setSelectedInterestIds] = useState<number[]>([])
    const [promptAnswers, setPromptAnswers] = useState<PromptAnswerInput[]>([])
    const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([])



    const [preferences, setPreferences] = useState<UpdatePreferencesRequest>({
        showMe: "Women",
        minAge: 18,
        maxAge: 50,
        maxDistanceKm: 50,
    })

    const getCurrentValue = () => {
        if (currentStepConfig.field === "preferences") {
            return preferences
        }
        if (currentStepConfig.field === "languages") {
            return selectedLanguageIds
        }
        if (currentStepConfig.field === "lifestyle") {
            return {
                heightCm: profileData.heightCm,
                workout: profileData.workout,
            } as LifestyleValue
        }
        if (currentStepConfig.field === "interests") {
            return selectedInterestIds
        }
        if (currentStepConfig.field === "prompts") {
            return promptAnswers
        }
        return profileData[currentStepConfig.field as keyof UpdateProfileRequest]
    }

    const handleStepChange = (val: any) => {
        if (currentStepConfig.field === "preferences") {
            setPreferences(val)
        }
        else if (currentStepConfig.field === "languages") {
            setSelectedLanguageIds(val)
        }
        else if (currentStepConfig.field === "prompts") {
            setPromptAnswers(val)
        }
        else if (currentStepConfig.field === "interests") {
            setSelectedInterestIds(val)
        }
        else if (currentStepConfig.field === "lifestyle") {
            const lifestyle = val as LifestyleValue
            setProfileData((prev) => ({
                ...prev,
                heightCm: lifestyle.heightCm,
                workout: lifestyle.workout,
            }))
        } else {
            updateField(currentStepConfig.field as keyof UpdateProfileRequest, val)
        }
    }


    const handleFinalSubmit = async () => {
        try {
            setIsLoading(true)

            // 1. Оновлюємо основний профіль
            const payload: UpdateProfileRequest = {
                ...profileData,
                displayName: profileData.displayName.trim() || user?.name || "Користувач",
            }
            await updateMyProfile(payload)

            // 2. Зберігаємо налаштування пошуку (preferences)
            await updateMyPreferences(preferences)

            // 2. Якщо користувач обрав інтереси — надсилаємо окремий запит
            if (selectedInterestIds.length > 0) {
                await updateMyInterests(selectedInterestIds)
            }
            // 3. Зберігаємо мови
            if (selectedLanguageIds.length > 0) {
                await updateMyLanguages(selectedLanguageIds)
            }
            // 3. Зберігаємо відповіді на промпти (тільки непорожні)
            const validAnswers = promptAnswers.filter((a) => a.answer.trim().length > 0)
            if (validAnswers.length > 0) {
                await updateMyPrompts(validAnswers)
            }

            navigate("/")
        } catch (error) {
            console.error("Помилка збереження відповідей тесту:", error)
            alert("Не вдалося зберегти профіль. Спробуйте ще раз.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <StepComponent
            currentStep={currentStep}
            totalSteps={totalSteps}
            value={getCurrentValue() as any as any}
            onChange={handleStepChange}

            onNext={isLastStep ? handleFinalSubmit : nextStep}
            onSubmit={handleFinalSubmit}
            onBack={!isFirstStep ? prevStep : undefined}
            isLoading={isLoading}
        />
    )
}