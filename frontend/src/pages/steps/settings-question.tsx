import React, { useEffect, useState } from "react"
import { TestPage } from "./test-page-layout"
import { SettingsSections } from "@/components/settings"
import {
  getMyProfile,
  getLookups,
  type MyProfile,
  type Lookups,
  type UpdatePreferencesRequest,
} from "@/services/auth-service"
import { saveMyLocation, updateLocationFromDevice } from "@/lib/location"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error"


interface SettingsStepValue {
  preferences: UpdatePreferencesRequest
  isPrivate: boolean
}

interface Props {
  currentStep: number
  totalSteps: number
  value: { preferences: UpdatePreferencesRequest; isPrivate: boolean }
  onChange: (val: SettingsStepValue) => void
  onSubmit: () => void
  onBack?: () => void
  isLoading?: boolean
}

export default function SettingsStep({
  currentStep,
  totalSteps,
  value,
  onChange,
  onSubmit,
  onBack,
  isLoading = false,
}: Props) {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [lookups, setLookups] = useState<Lookups | null>(null)
  const [isPrivate, setIsPrivate] = useState(false)

  const [isLocationChoiceOpen, setIsLocationChoiceOpen] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    let isMounted = true
    Promise.all([getMyProfile(), getLookups()])
      .then(([nextProfile, nextLookups]) => {
        if (!isMounted) return
        setProfile(nextProfile)
        setLookups(nextLookups)
        setIsPrivate(nextProfile.isPrivate)
      })
      .catch((error) => {
        console.error("Помилка завантаження даних кроку налаштувань:", error)
      })
      .finally(() => {
        if (isMounted) setIsFetching(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Автоматична геолокація
  async function handleAutoLocation() {
    setIsLocationChoiceOpen(false)
    setIsUpdatingLocation(true)
    try {
      await updateLocationFromDevice()
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Локацію оновлено за GPS" })
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Не вдалося визначити геолокацію",
        description: getApiErrorMessage(error, "Перевірте дозволи браузера."),
      })
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  // Ручний вибір на карті
  async function handleLocationSelected(lat: number, lng: number) {
    setIsUpdatingLocation(true)
    try {
      await saveMyLocation(lat, lng)
      const nextProfile = await getMyProfile()
      setProfile(nextProfile)
      toast.add({ type: "success", title: "Локацію оновлено" })
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Помилка оновлення",
        description: getApiErrorMessage(error, "Не вдалося зберегти координати."),
      })
    } finally {
      setIsUpdatingLocation(false)
    }
  }

  if (isFetching || !profile || !lookups) {
    return (
      <TestPage
        currentStep={currentStep}
        totalSteps={totalSteps}
        title="Налаштування пошуку та локації"
        canContinue={false}
        onNext={onSubmit}
        onBack={onBack}
        isLoading={true}
      >
        <div className="py-12 text-center text-sm text-muted-foreground">
          Завантаження налаштувань...
        </div>
      </TestPage>
    )
  }

  return (
    <TestPage
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Параметри пошуку та локація"
      canContinue={true}
      onNext={onSubmit}
      onBack={onBack}
      isLoading={isLoading}
      nextButtonText="Завершити"
    >
      <div className="py-2">
        <SettingsSections
          profile={profile}
          lookups={lookups}
          showMe={value.preferences.showMe}
          minAge={value.preferences.minAge}
          maxAge={value.preferences.maxAge}
          maxDistanceKm={value.preferences.maxDistanceKm}
          isPrivate={value.isPrivate}
          isSaving={false}
          isUpdatingLocation={isUpdatingLocation}
          isLocationChoiceOpen={isLocationChoiceOpen}
          isMapOpen={isMapOpen}
          onIsPrivateChange={(checked) => {
            onChange({
              preferences: value.preferences,
              isPrivate: checked,
            })
          }}
          onApplyFilters={(updated) => {
            onChange({
              preferences: {
                showMe: updated.showMe,
                minAge: updated.minAge,
                maxAge: updated.maxAge,
                maxDistanceKm: updated.maxDistanceKm,
              },
              isPrivate: value.isPrivate,
            })
          }}
          onOpenLocationChoice={() => setIsLocationChoiceOpen(true)}
          onCloseLocationChoice={setIsLocationChoiceOpen}
          onAutoLocation={() => void handleAutoLocation()}
          onOpenMap={() => {
            setIsLocationChoiceOpen(false)
            setIsMapOpen(true)
          }}
          onCloseMap={() => setIsMapOpen(false)}
          onLocationSelected={(lat, lng) => void handleLocationSelected(lat, lng)}
        />
      </div>
    </TestPage>
  )
}