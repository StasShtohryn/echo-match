import { useEffect, useState } from "react"
import { Navigate, useNavigate } from "react-router"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from "@/components/ui/toast"
import { getApiErrorMessage } from "@/lib/api-error"
import { confirmEmail, getMyProfile, resendEmailCode } from "@/services/auth-service"
import { useAuthStore } from "@/store/useAuthStore"

const RESEND_COOLDOWN_SECONDS = 60
const CODE_LENGTH = 6

export default function ConfirmEmailPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)

  const [code, setCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS)

  useEffect(() => {
    if (secondsLeft <= 0) return
    const timer = window.setTimeout(() => setSecondsLeft((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [secondsLeft])

  if (!user?.token) {
    return <Navigate to="/login" replace />
  }

  const currentUser = user

  async function continueAfterConfirmation() {
    try {
      await getMyProfile()
      navigate("/me", { replace: true })
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        navigate("/register?onboarding=1", { replace: true })
        return
      }
      throw error
    }
  }

  async function submit(value: string) {
    if (value.length !== CODE_LENGTH || isSubmitting) return

    setIsSubmitting(true)
    try {
      const response = await confirmEmail(value)

      login({
        userId: response.userId,
        email: response.email,
        accessToken: response.accessToken,
        name: currentUser.name,
        picture: currentUser.picture,
        provider: currentUser.provider,
      }, isAuthenticated)

      await continueAfterConfirmation()
    } catch (error: unknown) {
      setCode("")
      toast.add({
        type: "error",
        title: "Не вдалося підтвердити пошту",
        description: getApiErrorMessage(error, "Спробуйте ще раз."),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function resend() {
    try {
      await resendEmailCode()
      setSecondsLeft(RESEND_COOLDOWN_SECONDS)
      toast.add({
        type: "success",
        title: "Код надіслано",
        description: `Перевірте пошту ${currentUser.email}, зокрема папку «Спам».`,
      })
    } catch (error: unknown) {
      toast.add({
        type: "error",
        title: "Не вдалося надіслати код",
        description: getApiErrorMessage(error, "Спробуйте пізніше."),
      })
    }
  }

  function useAnotherAccount() {
    logout()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold">Підтвердіть пошту</h1>
          <p className="text-sm text-muted-foreground">
            Ми надіслали 6-значний код на {currentUser.email}. Він діє 15 хвилин.
          </p>
        </div>

        <InputOTP
          maxLength={CODE_LENGTH}
          value={code}
          onChange={setCode}
          onComplete={(value: string) => void submit(value)}
          disabled={isSubmitting}
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
        >
          <InputOTPGroup>
            {Array.from({ length: CODE_LENGTH }, (_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>

        <Button
          className="w-full"
          disabled={code.length !== CODE_LENGTH || isSubmitting}
          onClick={() => void submit(code)}
        >
          {isSubmitting ? "Перевіряємо…" : "Підтвердити"}
        </Button>

        <Button variant="ghost" disabled={secondsLeft > 0} onClick={() => void resend()}>
          {secondsLeft > 0 ? `Надіслати код ще раз через ${secondsLeft} с` : "Надіслати код ще раз"}
        </Button>

        <button
          type="button"
          className="text-xs text-muted-foreground underline"
          onClick={useAnotherAccount}
        >
          Увійти з іншим акаунтом
        </button>
      </div>
    </div>
  )
}
