import { Link, useLocation } from "react-router"
import { Compass, Flame, MessageCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/useAuthStore"
import { useUIStore } from "@/store/useUIStore"

interface NavItem {
  path: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { path: "/", label: "Свайпи", icon: Flame },
  { path: "/events", label: "Події", icon: Compass },
  { path: "/messenger", label: "Чати", icon: MessageCircle },
  { path: "/me", label: "Профіль", icon: User },
]

export default function BottomNav() {
  const location = useLocation()
  const { user } = useAuthStore()
  const { hasUnsavedChanges, isChatOpen } = useUIStore()

  const pathname = location.pathname
  const isMatchChat = pathname.startsWith("/messenger/") && pathname !== "/messenger"
  const isTestPage = pathname.includes("/test") || pathname.includes("/onboarding") || pathname.includes("/register")

  if (!user || isTestPage || isChatOpen || isMatchChat) {
    return null
  }

  const isTabActive = (itemPath: string) => {
    if (itemPath === "/") {
      return pathname === "/"
    }
    return pathname === itemPath || pathname.startsWith(`${itemPath}/`)
  }

  return (
    <nav
      aria-label="Мобільна навігація"
      className={cn(
        "fixed bottom-8 left-1/2 z-40 -translate-x-1/2 md:hidden transition-all duration-300 ease-out",
        hasUnsavedChanges
          ? "translate-y-20 opacity-0 pointer-events-none"
          : "translate-y-0 opacity-100 pointer-events-auto"
      )}
    >
      <div className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/95 p-1.5 shadow-2xl backdrop-blur-md ring-1 ring-black/5 dark:ring-white/10">
        {navItems.map((item) => {
          const active = isTabActive(item.path)
          const Icon = item.icon

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 rounded-full py-2 text-xs font-semibold transition-all duration-300 ease-out select-none",
                active
                  ? "bg-primary px-4 text-primary-foreground shadow-xs"
                  : "px-3 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "size-5 transition-transform duration-300",
                  active && "scale-105"
                )}
              />
              <span
                className={cn(
                  "overflow-hidden transition-all duration-300 ease-out whitespace-nowrap",
                  active
                    ? "max-w-20 opacity-100"
                    : "max-w-0 opacity-0 pointer-events-none"
                )}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
