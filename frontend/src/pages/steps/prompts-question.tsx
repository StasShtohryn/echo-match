import React, { useEffect, useState } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { TestPage } from "./test-page-layout"
import { getLookups, type LookupItem, type PromptAnswerInput } from "@/services/auth-service"
import { cn } from "@/lib/utils"

interface Props {
  currentStep: number
  totalSteps: number
  value: PromptAnswerInput[] | null
  onChange: (val: PromptAnswerInput[]) => void
  onNext: () => void
  onBack?: () => void
  isLoading?: boolean
}

const MAX_PROMPTS = 3

export default function PromptsStep({
  currentStep,
  totalSteps,
  value,
  onChange,
  onNext,
  onBack,
  isLoading = false,
}: Props) {
  const [promptsList, setPromptsList] = useState<LookupItem[]>([])
  const [isFetching, setIsFetching] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  // Поточні відповіді: масив { promptId, answer }
  const answers = value ?? []

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      try {
        setIsFetching(true)
        setFetchError(null)
        const lookups = await getLookups()
        if (isMounted) {
          setPromptsList(lookups.prompts ?? [])
        }
      } catch (err) {
        console.error("Не вдалося завантажити запитання:", err)
        if (isMounted) {
          setFetchError("Не вдалося завантажити список запитань")
        }
      } finally {
        if (isMounted) {
          setIsFetching(false)
        }
      }
    }

    void loadData()

    return () => {
      isMounted = false
    }
  }, [])

  // Кількість заповнених відповідей
  const filledCount = answers.filter((a) => a.answer.trim().length > 0).length

  // Знайти поточний текст відповіді для конкретного promptId
  const getAnswerText = (promptId: number) => {
    return answers.find((a) => a.promptId === promptId)?.answer ?? ""
  }

  // Обробка зміни відповіді
  const handleAnswerChange = (promptId: number, text: string) => {
    const existingIndex = answers.findIndex((a) => a.promptId === promptId)

    // Якщо текст очистили
    if (!text.trim()) {
      onChange(answers.filter((a) => a.promptId !== promptId))
      return
    }

    // Якщо новий запис і ліміт уже вичерпано
    if (existingIndex === -1 && filledCount >= MAX_PROMPTS) {
      return
    }

    if (existingIndex >= 0) {
      const updated = [...answers]
      updated[existingIndex] = { promptId, answer: text }
      onChange(updated)
    } else {
      onChange([...answers, { promptId, answer: text }])
    }
  }

  return (
    <TestPage
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Розкажіть про себе через запитання"
      canContinue={true}
      onNext={onNext}
      onBack={onBack}
      isLoading={isLoading}
      nextButtonText={filledCount === 0 ? "Пропустити" : "Далі"}
    >
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4 py-2">
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
          <span>Оберіть до {MAX_PROMPTS} запитань і дайте коротку відповідь:</span>
          <span
            className={cn(
              "text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors",
              filledCount === MAX_PROMPTS
                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                : filledCount > 0
                  ? "bg-primary/10 text-primary"
                  : "bg-muted text-muted-foreground"
            )}
          >
            {filledCount} / {MAX_PROMPTS} заповнено
          </span>
        </div>

        {isFetching ? (
          <div className="flex h-44 w-full items-center justify-center">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
        ) : fetchError ? (
          <div className="p-4 text-center text-xs text-destructive">
            {fetchError}
          </div>
        ) : (
          <Accordion className="flex w-full flex-col gap-2.5">
            {promptsList.map((item) => {
              const currentText = getAnswerText(item.id)
              const hasAnswer = currentText.trim().length > 0
              const isLimitReached = filledCount >= MAX_PROMPTS && !hasAnswer

              return (
                <AccordionItem
                  key={item.id}
                  value={`prompt-${item.id}`}
                  className={cn(
                    " overflow-hidden rounded-2xl border px-4 transition-all duration-200 shadow-xs",
                    hasAnswer
                      ? "border-primary bg-accent/40 ring-1 ring-primary/40"
                      : "border-border bg-card hover:border-primary/60"
                  )}
                >
                  <AccordionTrigger className="cursor-pointer py-3.5 hover:no-underlinetext-sm sm:text-base font-sans text-foreground">
                    <div className="flex items-center gap-2.5 text-left text-sm font-semibold text-foreground">
                      {hasAnswer && (
                        <CheckCircle2 className="size-4 shrink-0 text-primary" />
                      )}
                      <span>{item.name}</span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="pb-4 pt-1">
                    <div className="flex flex-col gap-2">
                      <Input
                        value={currentText}
                        disabled={isLimitReached}
                        placeholder={
                          isLimitReached
                            ? "Ви вже обрали максимум 3 запитання"
                            : "Напишіть вашу відповідь тут..."
                        }
                        onChange={(e) => handleAnswerChange(item.id, e.target.value)}
                        className="h-11 rounded-xl border border-input bg-card px-3.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring"
                      />
                      {isLimitReached && (
                        <p className="text-[11px] text-muted-foreground">
                          Очистіть відповідь в іншому питанні, щоб дати відповідь на це.
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </div>
    </TestPage>
  )
}