import { cn } from "@/lib/utils"
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
import { useAuthStore } from "@/store/useAuthStore"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { jwtDecode } from "jwt-decode"
import type { GoogleJwtPayload } from "@/types/auth.types"
import { useState } from "react"
import { getApiErrorMessage } from "@/lib/api-error"
import {
  createProfile as submitProfile,
  registerWithPassword,
} from "@/services/auth-service"
import {
  Questionnaire,
  QuestionnaireActions,
  QuestionnaireDescription,
  QuestionnaireError,
  QuestionnaireInput,
  QuestionnaireItem,
  QuestionnaireNext,
  QuestionnairePrevious,
  QuestionnaireProgress,
  QuestionnaireSubmit,
  QuestionnaireTitle,
} from "@/components/ui/questionnaire"

type RegistrationStep = "account" | "profile"

const questionnaireItems = [
  { name: "account", required: true },
  { name: "profile", required: true },
] as const

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [step, setStep] = useState<RegistrationStep>("account")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    birthDate: "",
    gender: "",
    avatarUrl: "",
  })

  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/me" replace />
  }

  function handleGoogleLogin(cred: CredentialResponse) {
    if (!cred.credential) return

    try {
      const decoded = jwtDecode<GoogleJwtPayload>(cred.credential)

      setFormData((previous) => ({
        ...previous,
        email: decoded.email,
        name: decoded.name,
        avatarUrl: decoded.picture ?? "",
      }))
      login({
        userId: decoded.sub,
        email: decoded.email,
        accessToken: cred.credential,
        name: decoded.name,
        picture: decoded.picture,
        provider: "google",
      }, false)
      setStep("profile")
    } catch (error) {
      console.error(error)
      toast.add({
        type: "error",
        title: "Виникла помилка",
        description: "Не вдалося прочитати дані Google.",
      })
    }
  }

  async function createAccount() {
    if (formData.password !== formData.confirmPassword) {
      toast.add({
        type: "error",
        title: "Помилка валідації",
        description: "Паролі не співпадають.",
      })
      return false
    }

    setIsSubmitting(true)
    try {
      const response = await registerWithPassword(formData.email, formData.password)

      login({
        userId: response.userId,
        email: response.email,
        accessToken: response.accessToken,
        provider: "local",
      }, false)
      setStep("profile")
      return true
    } catch (error: unknown) {
      const errorMessage =
        error && typeof error === "object" && "response" in error &&
        error.response && typeof error.response === "object" &&
        "status" in error.response && error.response.status === 409
          ? "Користувач з такою поштою вже існує"
          : getApiErrorMessage(error, "Щось пішло не так")

      toast.add({
        type: "error",
        title: "Виникла помилка",
        description: errorMessage,
      })
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  async function createProfile() {
    if (!user?.id || !user.token) {
      toast.add({
        type: "error",
        title: "Сесія втрачена",
        description: "Почніть реєстрацію ще раз.",
      })
      return
    }

    setIsSubmitting(true)
    try {
      await submitProfile(
        {
          displayName: formData.name,
          dateOfBirth: formData.birthDate,
          gender: formData.gender,
        },
        user.token,
      )

      login({
        userId: user.id,
        email: user.email,
        accessToken: user.token,
        name: formData.name,
        picture: formData.avatarUrl || user.picture,
        provider: user.provider,
      })
      navigate("/me")
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Не вдалося створити профіль",
        description: getApiErrorMessage(error, "Щось пішло не так"),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (step === "account") {
      void createAccount()
    } else {
      void createProfile()
    }
  }

  return (
    <Questionnaire
      item={step}
      items={questionnaireItems}
      onItemChange={(item) => setStep(item as RegistrationStep)}
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <QuestionnaireProgress
        className="w-full"
        render={(props, state) => (
          <div {...props}>
            <div className="mb-2 flex gap-1.5" aria-hidden="true">
              {Array.from({ length: state.total }, (_, index) => (
                <span
                  key={index}
                  className={
                    index < state.current
                      ? "h-1.5 flex-1 rounded-full bg-primary"
                      : "h-1.5 flex-1 rounded-full bg-muted"
                  }
                />
              ))}
            </div>
            <span>
              Питання {state.current} з {state.total}
            </span>
          </div>
        )}
      />
      <QuestionnaireItem name="account" required>
        <QuestionnaireTitle>Створіть обліковий запис</QuestionnaireTitle>
        <QuestionnaireDescription>
          Спочатку введіть email і пароль.
        </QuestionnaireDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">Електронна пошта</FieldLabel>
            <QuestionnaireInput
              id="email"
              type="email"
              value={formData.email}
              onChange={(event) =>
                setFormData({ ...formData, email: event.target.value })
              }
              className="bg-card shadow-sm"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Пароль</FieldLabel>
            <QuestionnaireInput
              id="password"
              type="password"
              value={formData.password}
              onChange={(event) =>
                setFormData({ ...formData, password: event.target.value })
              }
              className="bg-card shadow-sm"
              required
            />
            <FieldDescription>Має містити щонайменше 8 символів.</FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="confirm-password">Підтвердіть пароль</FieldLabel>
            <QuestionnaireInput
              id="confirm-password"
              type="password"
              value={formData.confirmPassword}
              onChange={(event) =>
                setFormData({ ...formData, confirmPassword: event.target.value })
              }
              className="bg-card shadow-sm"
              required
            />
          </Field>
        </FieldGroup>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireItem name="profile" required>
        <QuestionnaireTitle>Заповніть профіль</QuestionnaireTitle>
        <QuestionnaireDescription>
          Додайте дані про себе, щоб завершити реєстрацію.
        </QuestionnaireDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">Ім'я</FieldLabel>
            <QuestionnaireInput
              id="name"
              value={formData.name}
              onChange={(event) =>
                setFormData({ ...formData, name: event.target.value })
              }
              className="bg-card shadow-sm"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="birthDate">Дата народження</FieldLabel>
            <QuestionnaireInput
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(event) =>
                setFormData({ ...formData, birthDate: event.target.value })
              }
              className="bg-card shadow-sm"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="gender">Стать</FieldLabel>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value ?? "" })
              }
            >
              <SelectTrigger id="gender" className="w-full" aria-required="true">
                <SelectValue placeholder="Оберіть стать" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Чоловік</SelectItem>
                <SelectItem value="Female">Жінка</SelectItem>
                <SelectItem value="Other">Інше</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel htmlFor="avatar">Аватарка (необов'язково)</FieldLabel>
            <Input
              id="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="border-border bg-card shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () =>
                  setFormData((previous) => ({
                    ...previous,
                    avatarUrl: typeof reader.result === "string" ? reader.result : "",
                  }))
                reader.readAsDataURL(file)
              }}
            />
            {formData.avatarUrl && (
              <img
                src={formData.avatarUrl}
                alt="Попередній перегляд аватарки"
                className="size-20 rounded-full object-cover"
              />
            )}
          </Field>
        </FieldGroup>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireActions>
        <QuestionnairePrevious>Назад</QuestionnairePrevious>
        {step === "account" ? (
          <QuestionnaireNext
            onClick={(event) => {
              event.preventDefault()
              void createAccount()
            }}
            disabled={isSubmitting}
          >
            Далі
          </QuestionnaireNext>
        ) : (
          <QuestionnaireSubmit disabled={isSubmitting}>
            Завершити
          </QuestionnaireSubmit>
        )}
      </QuestionnaireActions>

      {step === "account" && (
        <>
          <FieldSeparator>Або продовжити за допомогою</FieldSeparator>
          <GoogleLogin
            shape="pill"
            size="medium"
            onSuccess={handleGoogleLogin}
            onError={() =>
              toast.add({
                type: "error",
                title: "Не вдалося зареєструватися через Google",
                description: "Спробуйте ще раз.",
              })
            }
          />
          <FieldDescription className="text-center">
            Вже маєте обліковий запис? <Link to="/login">Увійти</Link>
          </FieldDescription>
        </>
      )}
    </Questionnaire>
  )
}
