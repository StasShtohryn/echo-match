import { toast } from "@/components/ui/toast"

const LAST_UPDATED_KEY = "location_last_updated_at"
const LAST_DISMISSED_KEY = "location_last_dismissed_at"
const REMINDER_COOLDOWN_DAYS = 7
const REMINDER_COOLDOWN_MS = REMINDER_COOLDOWN_DAYS * 24 * 60 * 60 * 1000

export function markLocationUpdated() {
  localStorage.setItem(LAST_UPDATED_KEY, String(Date.now()))
}

export function markLocationDismissed() {
  localStorage.setItem(LAST_DISMISSED_KEY, String(Date.now()))
}

export function trackAppVisitAndRemind(onNavigateToSettings: () => void) {
  const now = Date.now()

  const lastUpdated = Number(localStorage.getItem(LAST_UPDATED_KEY) ?? "0")
  const lastDismissed = Number(localStorage.getItem(LAST_DISMISSED_KEY) ?? "0")

  if (!lastUpdated && !lastDismissed) {
    markLocationUpdated()
    return
  }

  if (now - lastUpdated < REMINDER_COOLDOWN_MS) {
    return
  }

  if (now - lastDismissed < REMINDER_COOLDOWN_MS) {
    return
  }

  markLocationDismissed()

  const toastId = toast.add({
    type: "info",
    title: "Оновіть геолокацію",
    description: "Ваша локація допомагає знаходити людей та події поблизу.",
    actionProps: {
      children: "Оновити",
      onClick() {
        toast.close(toastId)
        onNavigateToSettings()
      },
    },
  })
}
