import { useState } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import L from "leaflet"
import { Button } from "@/components/ui/button"
import { X, MapPin } from "lucide-react"

// Виправляємо відображення дефолтної іконки маркера в Leaflet
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"
import markerIcon from "leaflet/dist/images/marker-icon.png"
import markerShadow from "leaflet/dist/images/marker-shadow.png"

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
})

interface LocationPickerModalProps {
  initialLat?: number
  initialLng?: number
  onClose: () => void
  onSelectLocation: (lat: number, lng: number) => void
}

// Внутрішній компонент для відстеження кліку по карті
function LocationMarker({
  position,
  setPosition,
}: {
  position: { lat: number; lng: number }
  setPosition: (pos: { lat: number; lng: number }) => void
}) {
  useMapEvents({
    click(e) {
      setPosition({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  return <Marker position={[position.lat, position.lng]} />
}

export function LocationPickerModal({
  initialLat = 50.4501, // За замовчуванням Київ
  initialLng = 30.5234,
  onClose,
  onSelectLocation,
}: LocationPickerModalProps) {
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng })

  const handleConfirm = () => {
    onSelectLocation(position.lat, position.lng)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="relative flex flex-col w-full max-w-3xl h-[80vh] bg-background rounded-3xl border border-border overflow-hidden shadow-2xl">
        {/* Шапка */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <MapPin className="size-5 text-primary" />
            <h2 className="text-lg font-semibold font-sans">Оберіть ваше місто на карті</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        {/* Карта */}
        <div className="flex-1 min-h-0 w-full relative">
          <MapContainer
            center={[position.lat, position.lng]}
            zoom={6}
            scrollWheelZoom={true}
            className="size-full z-10"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>

        {/* Футер із підтвердженням */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-card">
          <div className="text-xs text-muted-foreground">
            Координати: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Скасувати
            </Button>
            <Button onClick={handleConfirm}>
              Підтвердити локацію
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}