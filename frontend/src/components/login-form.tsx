import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { Input } from "@/components/ui/input"
import { Link, Navigate, useNavigate } from "react-router"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { hasValidSession, useAuthStore } from "@/store/useAuthStore"
import type { GoogleJwtPayload } from "@/types/auth.types"
import { useState } from "react"
import { getApiErrorMessage } from "@/lib/api-error"
import {
  getMyProfile,
  loginWithPassword,
  signInWithGoogle,
} from "@/services/auth-service"
import { Eye, EyeOff } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [formData, setFormData] = useState({ email: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()

  const login = useAuthStore((state) => state.login)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (hasValidSession(user, isAuthenticated)) {
    return <Navigate to="/me" replace />
  }

  async function handleGoogleLogin(cred: CredentialResponse) {
    if (!cred.credential) return

    try {
      const decoded = jwtDecode<GoogleJwtPayload>(cred.credential)
      const response = await signInWithGoogle(cred.credential)

      login({
        userId: response.userId,
        email: response.email,
        accessToken: response.accessToken,
        name: decoded.name,
        picture: decoded.picture,
        provider: "google",
      })

      await navigateAfterAuthentication()
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Не вдалося увійти через Google",
        description: getApiErrorMessage(error, "Спробуйте ще раз."),
      })
    }
  }

  async function navigateAfterAuthentication() {
    try {
      await getMyProfile()
      navigate("/me")
    } catch (error: unknown) {
      const isMissingProfile =
        error && typeof error === "object" && "response" in error &&
        error.response && typeof error.response === "object" &&
        "status" in error.response && error.response.status === 404

      if (isMissingProfile) {
        navigate("/register?onboarding=1")
        return
      }

      throw error
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    try {
      const response = await loginWithPassword(formData.email, formData.password)

      login({
        userId: response.userId,
        email: response.email,
        accessToken: response.accessToken,
        provider: "local",
      })

      if (!response.isEmailConfirmed) {
        navigate("/confirm-email")
        return
      }

      await navigateAfterAuthentication()
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error &&
          error.response && typeof error.response === "object" &&
          "status" in error.response && error.response.status === 401
          ? "Неправильна електронна пошта або пароль"
          : getApiErrorMessage(error, "Щось пішло не так")

      toast.add({
        type: "error",
        title: "Виникла помилка",
        description: errorMessage,
      })
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleLogin}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Вхід до облікового запису</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Введіть електронну пошту та пароль нижче, щоб увійти до свого облікового запису
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Електронна пошта</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
            autoComplete="email"
            className="border-border bg-card shadow-sm"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Пароль</FieldLabel>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              className="border-border bg-card shadow-sm pr-10"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none cursor-pointer"
              aria-label={showPassword ? "Приховати пароль" : "Показати пароль"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </Field>

        <Field>
          <Button type="submit">Увійти</Button>
        </Field>
        <FieldSeparator>Або продовжити за допомогою</FieldSeparator>
        <Field>
          <GoogleLogin
            shape="pill"
            size="medium"
            onSuccess={handleGoogleLogin}
            onError={() =>
              toast.add({
                type: "error",
                title: "Не вдалося увійти через Google",
                description: "Спробуйте ще раз.",
              })
            }
          />
          <FieldDescription className="text-center">
            Ще не маєте облікового запису?{" "}
            <Link to="/register" className="underline underline-offset-4">
              Зареєструватися
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
