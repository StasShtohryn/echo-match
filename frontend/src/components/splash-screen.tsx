import { useEffect, useState } from "react"
import splashDark from "@/media/EchoMatch_spiner_black_theme.mp4"
import splashLight from "@/media/EchoMatch_spiner_white_theme.mp4"

interface SplashScreenProps {
  onFinish?: () => void
  durationMs?: number
}

export function SplashScreen({ onFinish, durationMs = 2500 }: SplashScreenProps) {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    // Перевіряємо клас на html або системну тему напряму
    const isDarkClass = document.documentElement.classList.contains("dark")
    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches
    return isDarkClass || isSystemDark
  })

  useEffect(() => {
    // Відстежуємо зміни класу dark на <html>
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains("dark")
      setIsDarkMode(isDark)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!onFinish) return
    const timer = setTimeout(() => {
      onFinish()
    }, durationMs)
    return () => clearTimeout(timer)
  }, [onFinish, durationMs])

  return (
    <div
      className="fixed inset-0 z-50 flex h-dvh w-screen items-center justify-center overflow-hidden transition-colors duration-300"
      style={{
        backgroundColor: isDarkMode ? "#0b1724" : "#fdf8f0"
      }}
    >
      <video
        key={isDarkMode ? "dark" : "light"}
        src={isDarkMode ? splashDark : splashLight}
        autoPlay
        muted
        playsInline
        className="max-h-[80vh] max-w-[80vw] object-contain"
        onEnded={onFinish}
      />
    </div>
  )
}