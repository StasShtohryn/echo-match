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
import { Link, Navigate, useNavigate, useSearchParams } from "react-router"
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
import { useEffect, useState } from "react"
import { getApiErrorMessage } from "@/lib/api-error"
import {
  createProfile as submitProfile,
  registerWithPassword,
  signInWithGoogle,
  uploadProfilePhoto,
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

const allQuestionnaireItems = [
  { name: "account", required: true },
  { name: "profile", required: true },
] as const

const onboardingQuestionnaireItems = [
  { name: "profile", required: true },
] as const

function getAccountErrors(formData: {
  email: string
  password: string
  confirmPassword: string
}) {
  const errors: {
    email?: string
    password?: string
    confirmPassword?: string
  } = {}

  if (!formData.email.trim()) {
    errors.email = "Введіть електронну пошту."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    errors.email = "Введіть коректну електронну пошту."
  }

  if (formData.password.length < 8) {
    errors.password = "Пароль має містити щонайменше 8 символів."
  } else if (!/[A-Z]/.test(formData.password)) {
    errors.password = "Пароль має містити велику літеру."
  } else if (!/[a-z]/.test(formData.password)) {
    errors.password = "Пароль має містити малу літеру."
  } else if (!/[0-9]/.test(formData.password)) {
    errors.password = "Пароль має містити цифру."
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Паролі не співпадають."
  }

  return errors
}

function getProfileErrors(formData: {
  name: string
  birthDate: string
  gender: string
  avatarFile: File | null
}) {
  const errors: {
    name?: string
    birthDate?: string
    gender?: string
    avatarFile?: string
  } = {}

  if (!formData.name.trim()) {
    errors.name = "Введіть ім'я."
  }

  if (!formData.birthDate) {
    errors.birthDate = "Оберіть дату народження."
  } else {
    const birthDate = new Date(`${formData.birthDate}T00:00:00`)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const birthdayNotReached =
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() < birthDate.getDate())

    if (birthdayNotReached) {
      age -= 1
    }

    if (Number.isNaN(birthDate.getTime()) || age < 18) {
      errors.birthDate = "Вам має бути щонайменше 18 років."
    } else if (age > 100) {
      errors.birthDate = "Вкажіть коректну дату народження."
    }
  }

  if (!formData.gender) {
    errors.gender = "Оберіть стать."
  }

  if (!formData.avatarFile) {
    errors.avatarFile = "Додайте аватарку."
  }

  return errors
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [searchParams] = useSearchParams()
  const isOnboarding = searchParams.has("onboarding")
  const questionnaireItems = isOnboarding
    ? onboardingQuestionnaireItems
    : allQuestionnaireItems

  const [step, setStep] = useState<RegistrationStep>(
    isOnboarding ? "profile" : "account"
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    birthDate: "",
    gender: "",
    avatarUrl: "",
    avatarFile: null as File | null,
  })
  const [showAccountErrors, setShowAccountErrors] = useState(false)

  const navigate = useNavigate()
  const login = useAuthStore((state) => state.login)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const accountErrors = getAccountErrors(formData)
  const profileErrors = getProfileErrors(formData)
  const [showProfileErrors, setShowProfileErrors] = useState(false)

  useEffect(() => {
    if (isOnboarding) {
      setStep("profile")
    }
  }, [isOnboarding])

  if (isAuthenticated && !isOnboarding) {
    return <Navigate to="/me" replace />
  }

  async function handleGoogleLogin(cred: CredentialResponse) {
    if (!cred.credential) return

    try {
      const decoded = jwtDecode<GoogleJwtPayload>(cred.credential)
      const response = await signInWithGoogle(cred.credential)

      setFormData((previous) => ({
        ...previous,
        email: response.email,
        name: decoded.name,
        avatarUrl: decoded.picture ?? "",
      }))
      login({
        userId: response.userId,
        email: response.email,
        accessToken: response.accessToken,
        name: decoded.name,
        picture: decoded.picture,
        provider: "google",
      }, false)
      setStep("profile")
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Виникла помилка",
        description: getApiErrorMessage(error, "Не вдалося увійти через Google."),
      })
    }
  }

  async function createAccount() {
    setShowAccountErrors(true)

    const accountErrors = getAccountErrors(formData)
    if (Object.keys(accountErrors).length > 0) {
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
    setShowProfileErrors(true)

    if (Object.keys(profileErrors).length > 0) {
      return
    }

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
      )
      const uploadedPhoto = await uploadProfilePhoto(formData.avatarFile as File)

      login({
        userId: user.id,
        email: user.email,
        accessToken: user.token,
        name: formData.name,
        picture: uploadedPhoto.url,
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
      noValidate
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
              Крок {state.current} з {state.total}
            </span>
          </div>
        )}
      />
      {!isOnboarding && (
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
                placeholder="you@example.com"
                pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                autoComplete="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData({ ...formData, email: event.target.value })
                }
                aria-invalid={showAccountErrors && !!accountErrors.email}
                className={cn(
                  "bg-card shadow-sm",
                  showAccountErrors && accountErrors.email &&
                  "border-destructive ring-3 ring-destructive/20"
                )}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="password">Пароль</FieldLabel>
              <QuestionnaireInput
                id="password"
                type="password"
                minLength={8}
                value={formData.password}
                onChange={(event) =>
                  setFormData({ ...formData, password: event.target.value })
                }
                aria-invalid={showAccountErrors && !!accountErrors.password}
                className={cn(
                  "bg-card shadow-sm",
                  showAccountErrors && accountErrors.password &&
                  "border-destructive ring-3 ring-destructive/20"
                )}
                required
              />
              <FieldDescription>
                8+ символів, велика і мала літери та цифра.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="confirm-password">Підтвердіть пароль</FieldLabel>
              <QuestionnaireInput
                id="confirm-password"
                type="password"
                minLength={8}
                value={formData.confirmPassword}
                onChange={(event) =>
                  setFormData({ ...formData, confirmPassword: event.target.value })
                }
                aria-invalid={showAccountErrors && !!accountErrors.confirmPassword}
                className={cn(
                  "bg-card shadow-sm",
                  showAccountErrors && accountErrors.confirmPassword &&
                  "border-destructive ring-3 ring-destructive/20"
                )}
                required
              />
            </Field>
          </FieldGroup>
          <QuestionnaireError />
        </QuestionnaireItem>
      )}

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
              aria-invalid={showProfileErrors && !!profileErrors.name}
              className={cn(
                "bg-card shadow-sm",
                showProfileErrors && profileErrors.name &&
                "border-destructive ring-3 ring-destructive/20"
              )}
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="birthDate">Дата народження</FieldLabel>
            <Input
              id="birthDate"
              type="date"
              value={formData.birthDate}
              onChange={(event) =>
                setFormData({ ...formData, birthDate: event.target.value })
              }
              aria-invalid={showProfileErrors && !!profileErrors.birthDate}
              className={cn(
                "bg-card shadow-sm",
                showProfileErrors && profileErrors.birthDate &&
                "border-destructive ring-3 ring-destructive/20"
              )}
              required
            />
            <FieldDescription>
              Вам має бути щонайменше 18 років.
            </FieldDescription>
          </Field>
          <Field>
            <FieldLabel htmlFor="gender">Стать</FieldLabel>
            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value ?? "" })
              }
            >
              <SelectTrigger
                id="gender"
                aria-required="true"
                aria-invalid={showProfileErrors && !!profileErrors.gender}
                className={cn(
                  "bg-card",
                  "shadow-sm",
                  "w-full",
                  showProfileErrors && profileErrors.gender &&
                  "border-destructive ring-3 ring-destructive/20"
                )}
              >
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
            <FieldLabel htmlFor="avatar">Аватарка</FieldLabel>
            <Input
              id="avatar"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="border-border bg-card shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-primary-foreground"
              onChange={(event) => {
                const file = event.target.files?.[0]
                if (!file) return
                setFormData((previous) => ({
                  ...previous,
                  avatarFile: file,
                  avatarUrl: URL.createObjectURL(file),
                }))
              }}
              aria-invalid={showProfileErrors && !!profileErrors.avatarFile}
              required
            />
            {formData.avatarUrl && (
              <img
                src={formData.avatarUrl}
                alt="Попередній перегляд аватарки"
                className="size-20 rounded-full object-cover"
              />
            )}
            {showProfileErrors && profileErrors.avatarFile && (
              <p className="text-sm text-destructive">{profileErrors.avatarFile}</p>
            )}
          </Field>
        </FieldGroup>
        <QuestionnaireError />
      </QuestionnaireItem>

      <QuestionnaireActions>
        {!isOnboarding && <QuestionnairePrevious>Назад</QuestionnairePrevious>}
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

      {!isOnboarding && step === "account" && (
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
