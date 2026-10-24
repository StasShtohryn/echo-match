import { LocateFixed, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { LocationPickerModal } from "@/components/location-picker-modal"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FilterPanel } from "@/components/filter-panel"
import type { MyProfile, Lookups, UpdatePreferencesRequest } from "@/services/auth-service"

type ProfileWithCoords = MyProfile & {
  latitude?: number | null
  longitude?: number | null
}

interface SettingsSectionsProps {
  profile: MyProfile
  lookups: Lookups
  showMe: string
  minAge: number
  maxAge: number
  maxDistanceKm: number | null
  isPrivate: boolean
  isSaving: boolean
  isUpdatingLocation: boolean
  isLocationChoiceOpen: boolean
  isMapOpen: boolean
  onIsPrivateChange: (checked: boolean) => void
  onApplyFilters: (updatedPreferences: UpdatePreferencesRequest) => void
  onOpenLocationChoice: () => void
  onCloseLocationChoice: (open: boolean) => void
  onAutoLocation: () => void
  onOpenMap: () => void
  onCloseMap: () => void
  onLocationSelected: (lat: number, lng: number) => void
}

export function SettingsSections({
  profile,
  showMe,
  minAge,
  maxAge,
  maxDistanceKm,
  isPrivate,
  isSaving,
  isUpdatingLocation,
  isLocationChoiceOpen,
  isMapOpen,
  onIsPrivateChange,
  onApplyFilters,
  onOpenLocationChoice,
  onCloseLocationChoice,
  onAutoLocation,
  onOpenMap,
  onCloseMap,
  onLocationSelected,
}: SettingsSectionsProps) {
  const profileCoords = profile as ProfileWithCoords

  return (
    <>
      {/* Двоколонкова сітка */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Ліва колонка: Фільтри пошуку */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="text-xl font-semibold font-sans">Кого показувати</CardTitle>
          </CardHeader>
          <CardContent>
            <FilterPanel
              isSaving={isSaving}
              hideSubmitButton={true}
              initialPreferences={{
                showMe: showMe || "Women",
                minAge: minAge,
                maxAge: maxAge,
                maxDistanceKm: maxDistanceKm,
              }}
              onApply={onApplyFilters}
            />
          </CardContent>
        </Card>

        {/* Права колонка: Конфіденційність та Локація */}
        <div className="flex flex-col justify-between gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold font-sans">Конфіденційність</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 text-sm">
                <Checkbox
                  id="isPrivate"
                  checked={isPrivate}
                  onCheckedChange={(checked) => onIsPrivateChange(checked === true)}
                />
                <label htmlFor="isPrivate" className="cursor-pointer">
                  Приховати мій профіль з пошуку
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold font-sans">Локація</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Поточне місто:{" "}
                    <span className="font-medium text-foreground">
                      {profile.city ?? "не визначено"}
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Місто визначається за координатами через{" "}
                    <a
                      href="https://www.openstreetmap.org/copyright"
                      target="_blank"
                      rel="noreferrer"
                      className="underline underline-offset-4"
                    >
                      OpenStreetMap
                    </a>
                    .
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={onOpenLocationChoice}
                  disabled={isUpdatingLocation || isSaving}
                >
                  <LocateFixed className="size-4 mr-2" />
                  {isUpdatingLocation ? "Оновлюємо..." : "Оновити геолокацію"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Диалогове вікно вибору способу оновлення геолокації */}
      <AlertDialog open={isLocationChoiceOpen} onOpenChange={onCloseLocationChoice}>
        <AlertDialogContent className="sm:max-w-md text-center">
          <AlertDialogHeader className="flex flex-col items-center text-center sm:text-center">
            <AlertDialogTitle className="font-sans text-center w-full">
              Спосіб оновлення геолокації
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              Оберіть, як саме ви бажаєте вказати своє поточне місцезнаходження.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-col sm:items-center">
            <Button className="w-full justify-center" onClick={onAutoLocation}>
              <LocateFixed className="size-4 mr-2" />
              Автоматично (за GPS пристрою)
            </Button>
            <Button variant="outline" className="w-full justify-center" onClick={onOpenMap}>
              <MapPin className="size-4 mr-2" />
              Обрати точку вручну на карті
            </Button>
            <AlertDialogCancel className="mt-2 w-full justify-center">Скасувати</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Модальне вікно з картами */}
      {isMapOpen && (
        <LocationPickerModal
          initialLat={profileCoords.latitude ?? 50.4501}
          initialLng={profileCoords.longitude ?? 30.5234}
          onClose={onCloseMap}
          onSelectLocation={onLocationSelected}
        />
      )}
    </>
  )
}