import { useEffect } from "react"
import { Navigate, Routes, Route } from "react-router"
import LoginPage from "./pages/login-page"
import HomePage from "./pages/home-page"
import RegisterPage from "./pages/register-page"
import ProfilePage from "./pages/profile-page"
import { TooltipProvider } from "@/components/ui/tooltip"
import MessengerPage from "./pages/messenger-page.tsx"
import MainLayout from "./layouts/main-layout.tsx"
import NotFoundPage from "./pages/not-found-page.tsx"
import ProfileEditPage from "./pages/profile-edit-page.tsx"
import ProfileSettingsPage from "./pages/profile-settings-page.tsx"
import { getSessionExpiration, hasValidSession, useAuthStore } from "@/store/useAuthStore"
import TestPage from "./pages/steps/test-page.tsx"
import PsychologicalQuizPage from "./pages/steps/psycologic-tests.tsx"

function SessionMonitor() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const expiresAt = getSessionExpiration(user?.token)
  const hasSession = hasValidSession(user, isAuthenticated)

  useEffect(() => {
    if (!hasSession || expiresAt === null) {
      if (isAuthenticated || user) logout()
      return
    }

    const timeout = window.setTimeout(logout, expiresAt - Date.now())
    return () => window.clearTimeout(timeout)
  }, [expiresAt, hasSession, isAuthenticated, logout, user])

  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)

  return hasValidSession(user, isAuthenticated) ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <TooltipProvider>
      <SessionMonitor />
      <Routes>
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tests" element={<TestPage />} />
          <Route path="/me" element={<ProfilePage />} />
          <Route path="/me/edit" element={<ProfileEditPage />} />
          <Route path="/settings" element={<ProfileSettingsPage />} />
          <Route path="/messenger" element={<MessengerPage />} />
          <Route path="/messenger/:matchId" element={<MessengerPage />} />
          <Route path="/quiz" element={<PsychologicalQuizPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </TooltipProvider>
  )
}

export default App
