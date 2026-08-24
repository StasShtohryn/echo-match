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
import { useAuthStore } from "@/store/useAuthStore" 
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import type { GoogleUser } from "@/types/user.types"

export function SignupForm({
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
    if (!cred.credential) return

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
          <h1 className="text-2xl font-bold">Створіть обліковий запис</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Заповніть форму нижче, щоб створити обліковий запис
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Повне ім'я</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Іван Петренко"
            className="border-border bg-card shadow-sm"
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Електронна пошта</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            className="border-border bg-card shadow-sm"
            required
          />
          <FieldDescription>
            Ми використаємо цю адресу, щоб зв'язатися з вами. Ми не передаватимемо
            вашу електронну пошту третім особам.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Пароль</FieldLabel>
          <Input
            id="password"
            type="password"
            className="border-border bg-card shadow-sm"
            required
          />
          <FieldDescription>
            Має містити щонайменше 8 символів.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Підтвердіть пароль</FieldLabel>
          <Input
            id="confirm-password"
            type="password"
            className="border-border bg-card shadow-sm"
            required
          />
          <FieldDescription>Підтвердьте свій пароль.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit">Створити обліковий запис</Button>
        </Field>
        <FieldSeparator>Або продовжити за допомогою</FieldSeparator>
        <Field>
          <GoogleLogin shape="pill" size="medium" onSuccess={handleLogin} onError={() => console.log("Login failed") }/>
          <FieldDescription className="px-6 text-center">
            Вже маєте обліковий запис? <Link to="/login">Увійти</Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
