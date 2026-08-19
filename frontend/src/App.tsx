import { Routes, Route } from "react-router"
import LoginPage from "./pages/login-page"
import HomePage from "./pages/home-page"
import RegisterPage from "./pages/register-page"

function App() {

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}

export default App
