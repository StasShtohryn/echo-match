import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error"
import { updateMyLocation } from "@/services/auth-service"

interface ReverseGeocodeResponse {
  address?: {
    city?: string
    town?: string
    village?: string
    municipality?: string
    hamlet?: string
  }
}

function showLocationError(description: string) {
  toast.add({
    type: "warning",
    title: "Геолокацію не оновлено",
    description,
  })
}

function showCityError(description: string) {
  toast.add({
    type: "warning",
    title: "Місто не визначено",
    description,
  })
}

async function getCity(latitude: number, longitude: number): Promise<string> {
  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    zoom: "10",
    lat: String(latitude),
    lon: String(longitude),
  })
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params}`, {
    headers: { "Accept-Language": "uk" },
  })

  if (!response.ok) {
    throw new Error(`OpenStreetMap повернув помилку HTTP ${response.status}.`)
  }

  const result: ReverseGeocodeResponse = await response.json()
  const city = [
    result.address?.city,
    result.address?.town,
    result.address?.village,
    result.address?.municipality,
    result.address?.hamlet,
  ].find((value) => value?.trim())

  if (!city) {
    throw new Error("Не знайдено населеного пункту за цими координатами.")
  }

  return city.trim().slice(0, 100)
}

export async function saveMyLocation(latitude: number, longitude: number): Promise<void> {
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
    !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    throw new Error("Вкажіть коректні координати.")
  }

  let city: string | undefined
  try {
    city = await getCity(latitude, longitude)
  } catch (error: unknown) {
    showCityError(
      `Координати буде збережено, але місто визначити не вдалося. ${getApiErrorMessage(error, "Спробуйте пізніше.")}`,
    )
  }

  await updateMyLocation(latitude, longitude, city)
}



export async function updateLocationFromDevice(): Promise<void> {
  if (!navigator.geolocation) {
    throw new Error("Браузер не підтримує визначення місцезнаходження.")
  }

  const position = await new Promise<GeolocationPosition>((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      resolve,
      (error) => {
        const description = error.code === error.PERMISSION_DENIED
          ? "Дозвольте доступ до геолокації в налаштуваннях браузера та спробуйте знову."
          : error.code === error.POSITION_UNAVAILABLE
            ? "Браузер не зміг визначити ваше місцезнаходження."
            : "Час очікування геолокації минув. Спробуйте ще раз."

        reject(new Error(description))
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    )
  })

  await saveMyLocation(position.coords.latitude, position.coords.longitude)
}
