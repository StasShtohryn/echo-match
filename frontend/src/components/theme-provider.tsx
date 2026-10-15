import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "system"
export type AccentColor = "orange" | "rose"
export type DarkAccentColor = "teal" | "violet"

type ThemeProviderProps = {
  children: React.ReactNode
  defaultTheme?: Theme
  storageKey?: string
  accentStorageKey?: string
  darkAccentStorageKey?: string
}

type ThemeProviderState = {
  theme: Theme
  setTheme: (theme: Theme) => void
  accentColor: AccentColor
  setAccentColor: (accentColor: AccentColor) => void
  darkAccentColor: DarkAccentColor
  setDarkAccentColor: (accentColor: DarkAccentColor) => void
}

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  accentColor: "orange",
  setAccentColor: () => null,
  darkAccentColor: "teal",
  setDarkAccentColor: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  accentStorageKey = "echomatch-accent-color",
  darkAccentStorageKey = "echomatch-dark-accent-color",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  )
  const [accentColor, setAccentColor] = useState<AccentColor>(() => {
    const storedAccentColor = localStorage.getItem(accentStorageKey)
    return storedAccentColor === "rose" ? "rose" : "orange"
  })
  const [darkAccentColor, setDarkAccentColor] = useState<DarkAccentColor>(() => {
    const storedAccentColor = localStorage.getItem(darkAccentStorageKey)
    return storedAccentColor === "violet" ? "violet" : "teal"
  })

  useEffect(() => {
    const root = window.document.documentElement
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    const updateTheme = () => {
      const resolvedTheme =
        theme === "system"
          ? mediaQuery.matches
            ? "dark"
            : "light"
          : theme

      root.classList.remove("light", "dark")
      root.classList.add(resolvedTheme)
      root.classList.toggle(
        "rose",
        resolvedTheme === "light" && accentColor === "rose"
      )
      root.classList.toggle(
        "dark-violet",
        resolvedTheme === "dark" && darkAccentColor === "violet"
      )
    }

    updateTheme()

    if (theme !== "system") {
      return
    }

    mediaQuery.addEventListener("change", updateTheme)
    return () => mediaQuery.removeEventListener("change", updateTheme)
  }, [theme, accentColor, darkAccentColor])

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme)
      setTheme(theme)
    },
    accentColor,
    setAccentColor: (accentColor: AccentColor) => {
      localStorage.setItem(accentStorageKey, accentColor)
      setAccentColor(accentColor)
    },
    darkAccentColor,
    setDarkAccentColor: (darkAccentColor: DarkAccentColor) => {
      localStorage.setItem(darkAccentStorageKey, darkAccentColor)
      setDarkAccentColor(darkAccentColor)
    },
  }

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider")

  return context
}