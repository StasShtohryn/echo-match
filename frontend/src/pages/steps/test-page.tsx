import { useState } from "react"
import { useNavigate } from "react-router"
import { updateMyProfile } from "@/services/auth-service"
import type { UpdateProfileRequest } from "@/services/auth-service"
import { useAuthStore } from "@/store/useAuthStore"

import GenderStep from "./gender-question"
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



const stepsConfig = [
    {
        field: "gender" as const,
        component: GenderStep,
    },
    {
        field: "orientation" as const,
        component: OrientationStep,
    },
    {
        field: "lookingFor" as const,
        component: GoalsStep,
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
        field: "school" as const,
        component: SchoolStep,
    },

    {
        field: "lifestyle" as const,
        component: LifestyleStep
    },

    {
        field: "familyPlans" as const,
        component: FamilyPlansStep
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
        field: "pets" as const,
        component: PetsStep
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
        field: "bio" as const,
        component: BioStep,
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

    const [profileData, setProfileData] = useState<UpdateProfileRequest>({
        displayName: user?.name ?? "User",
        gender: "",
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

    const handleFinalSubmit = async () => {
        try {
            setIsLoading(true)
            await updateMyProfile(profileData)
            navigate("/")
        } catch (error) {
            console.error("Помилка збереження відповідей тесту:", error)
            alert("Не вдалося зберегти профіль. Спробуйте ще раз.")
        } finally {
            setIsLoading(false)
        }
    }

    const currentStepConfig = stepsConfig[currentStep - 1]
    const StepComponent = currentStepConfig.component

    const getCurrentValue = () => {
        if (currentStepConfig.field === "lifestyle") {
            return {
                heightCm: profileData.heightCm,
                workout: profileData.workout,
            } as LifestyleValue
        }
        return profileData[currentStepConfig.field as keyof UpdateProfileRequest]
    }

    // Оновлюємо значення: якщо це lifestyle, розгортаємо його в heightCm та workout
    const handleStepChange = (val: any) => {
        if (currentStepConfig.field === "lifestyle") {
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