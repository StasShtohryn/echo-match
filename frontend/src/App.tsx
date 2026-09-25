import { Navigate, Routes, Route } from "react-router"
import LoginPage from "./pages/login-page"
import HomePage from "./pages/home-page"
import RegisterPage from "./pages/register-page"
import ProfilePage from "./pages/profile-page"
import { TooltipProvider } from "@/components/ui/tooltip"
import MessengerPage from "./pages/messenger-page.tsx"
import PsychologicQuizPage from "./pages/psychologic-quiz-page.tsx"
import MainLayout from "./layouts/main-layout.tsx"
import NotFoundPage from "./pages/not-found-page.tsx"
import ProfileEditPage from "./pages/profile-edit-page.tsx"
import ProfileSettingsPage from "./pages/profile-settings-page.tsx"
import { useAuthStore } from "@/store/useAuthStore"
import TestPage from "./pages/steps/test-page.tsx"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <TooltipProvider>
      <Routes>
        <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route path="/" element={<HomePage />} />
          <Route path="/tests" element={<TestPage />} />
          <Route path="/quiz" element={<PsychologicQuizPage />} />
          <Route path="/me" element={<ProfilePage />} />
          <Route path="/me/edit" element={<ProfileEditPage />} />
          <Route path="/settings" element={<ProfileSettingsPage />} />
          <Route path="/messenger" element={<MessengerPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </TooltipProvider>
  )
}

export default App
