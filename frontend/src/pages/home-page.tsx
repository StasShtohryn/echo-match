import { useEffect, useState } from "react"
import { useNavigate } from "react-router"
import PersonCard from "@/components/person-card"
import { FilterMatchPanel } from "@/components/filter-match-panel"
import { InfoPanel } from "@/components/info-panel"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error"
import { getMyProfile, updateMyPreferences, type DiscoveryPreferences, type DiscoveryStatus, type UpdatePreferencesRequest } from "@/services/auth-service"
import { useDiscoveryFeed } from "@/hooks/use-discovery-feed"
import { useMatches } from "@/hooks/use-matches.tsx"

const statusContent: Record<DiscoveryStatus, { title: string; description: string; action?: string }> = {
  Ready: { title: "Шукаємо пару", description: "Завантажуємо анкети для вас." },
  NoCandidates: { title: "Нових анкет немає", description: "Спробуйте змінити фільтри або поверніться пізніше.", action: "Змінити фільтри" },
  ProfileHidden: { title: "Профіль прихований", description: "Зробіть профіль видимим, щоб переглядати рекомендації.", action: "Відкрити налаштування" },
  PhotoRequired: { title: "Додайте фото", description: "Для discovery потрібна хоча б одна фотографія.", action: "Відкрити профіль" },
  PreferencesRequired: { title: "Налаштуйте preferences", description: "Вкажіть, кого та якого віку ви хочете бачити.", action: "Змінити фільтри" },
  LocationRequired: { title: "Потрібна локація", description: "Додайте локацію або вимкніть обмеження відстані.", action: "Відкрити налаштування" },
}

export default function HomePage() {
  const navigate = useNavigate()
  const [isSavingFilters, setIsSavingFilters] = useState(false)
  const [preferences, setPreferences] = useState<DiscoveryPreferences | null>(null)
  const { currentCandidate, status, isLoading, isSwiping, error, lastSwipe, swipe, refresh, dismissSwipeResult } = useDiscoveryFeed()
  const { matches, isLoading: isMatchesLoading, refresh: refreshMatches } = useMatches()

  useEffect(() => {
    getMyProfile().then((profile) => {
      setPreferences(profile.preferences)
      if (profile.preferences) void refresh()
    }).catch(() => undefined)
  }, [refresh])

  useEffect(() => {
    if (lastSwipe?.isMatch) void refreshMatches()
  }, [lastSwipe, refreshMatches])

  async function applyFilters(preferences: UpdatePreferencesRequest) {
    setIsSavingFilters(true)
    try {
      await updateMyPreferences(preferences)
      await refresh()
      toast.add({ type: "success", title: "Фільтри збережено" })
    } catch (nextError: unknown) {
      toast.add({ type: "error", title: "Не вдалося зберегти фільтри", description: getApiErrorMessage(nextError, "Перевірте значення полів.") })
    } finally {
      setIsSavingFilters(false)
    }
  }

  const currentStatus = statusContent[status]
  const showStatus = isLoading || !currentCandidate || status !== "Ready"

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <FilterMatchPanel matches={matches} isMatchesLoading={isMatchesLoading} initialPreferences={preferences} isSaving={isSavingFilters} onApply={(nextPreferences) => void applyFilters(nextPreferences)} />
      <main className="flex min-h-0 flex-1 items-center justify-center bg-muted/20 p-4">
        {showStatus ? (
          <div className="flex max-w-sm flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-semibold">{isLoading ? "Завантаження..." : currentStatus.title}</h2>
            {!isLoading && <p className="text-sm text-muted-foreground">{currentStatus.description}</p>}
            {!isLoading && currentStatus.action && <Button onClick={() => navigate(status === "PhotoRequired" ? "/me" : "/settings")}>{currentStatus.action}</Button>}
            {error && <p className="text-sm text-destructive">{getApiErrorMessage(error, "Не вдалося завантажити анкети.")}</p>}
          </div>
        ) : (
          <PersonCard candidate={currentCandidate} isSwiping={isSwiping} onSwipe={(direction) => void swipe(direction)} />
        )}
      </main>
      <InfoPanel displayName={currentCandidate?.profile.displayName ?? "Ваш discovery"} age={currentCandidate?.profile.age ?? 0} bio={currentCandidate?.profile.bio ?? null} lookingFor={currentCandidate?.profile.lookingFor ?? undefined} distanceKm={currentCandidate?.distanceKm ?? null} />
      {lastSwipe?.isMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm space-y-4 rounded-2xl bg-background p-6 text-center shadow-xl">
            <h2 className="text-2xl font-bold">У вас метч!</h2>
            <p className="text-sm text-muted-foreground">Ви сподобалися одне одному.</p>
            <Button onClick={dismissSwipeResult}>Продовжити</Button>
          </div>
        </div>
      )}
    </div>
  )
}