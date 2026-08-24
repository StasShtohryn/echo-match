import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Link, Navigate, useNavigate } from "react-router"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import { useAuthStore } from "@/store/useAuthStore"
import type { GoogleUser } from "@/types/user.types"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const navigate = useNavigate()

  const login = useAuthStore((state) => state.login)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/me" replace />
  }

  function handleLogin(cred: CredentialResponse) {
    if (!cred.credential) return;

    try {
      const decodedUser = jwtDecode<GoogleUser>(cred.credential)

      login(decodedUser)
      navigate("/me")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
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
            placeholder="m@example.com"
            className="border-border bg-card shadow-sm"
            required
          />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Пароль</FieldLabel>
            {/* <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Забули пароль?
            </a> */}
          </div>
          <Input
            id="password"
            type="password"
            className="border-border bg-card shadow-sm"
            required
          />
        </Field>
        <Field>
          <Button type="submit">Увійти</Button>
        </Field>
        <FieldSeparator>Або продовжити за допомогою</FieldSeparator>
        <Field>
          <GoogleLogin shape="pill" size="medium" onSuccess={handleLogin} onError={() => console.log("Login failed") }/>
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
