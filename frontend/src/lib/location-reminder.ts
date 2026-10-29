import { toast } from "@/components/ui/toast"

const VISITS_KEY = "app_visit_count"
const REMINDER_THRESHOLD = 12

export function trackAppVisitAndRemind(onNavigateToSettings: () => void) {
    // Зчитуємо поточну кількість заходів
    const currentVisits = Number(localStorage.getItem(VISITS_KEY) ?? "0") + 1
    localStorage.setItem(VISITS_KEY, String(currentVisits))

    // Якщо досягли лічильника — показуємо toast
    if (currentVisits >= REMINDER_THRESHOLD) {
        localStorage.setItem(VISITS_KEY, "0") // Скидаємо лічильник

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
}