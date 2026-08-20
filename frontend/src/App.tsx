import { Routes, Route } from "react-router"
import LoginPage from "./pages/login-page"
import HomePage from "./pages/home-page"
import RegisterPage from "./pages/register-page"
import ProfilePage from "./pages/profile-page"
import { TooltipProvider } from "@/components/ui/tooltip"
import MessengerPage from "./pages/messenger-page.tsx"
import PsychologicQuizPage from "./pages/psychologic-quiz-page.tsx"
import MainLayout from "./layouts/main-layout.tsx"
import NotFoundPage from "./pages/not-found-page.tsx"

function App() {

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={
            <TooltipProvider>
              <HomePage />
            </TooltipProvider>
          } />
        <Route path="/quiz" element={<PsychologicQuizPage />} />
        <Route path="/me" element={
          <TooltipProvider>
            <ProfilePage />
          </TooltipProvider>
          } />
        <Route path="/messenger" element={<MessengerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>


      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}

export default App
