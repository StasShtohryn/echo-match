import { useRef, useState } from "react"
import { useNavigate } from "react-router"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/toast"

import { QUIZ_OPTIONS, QUIZ_QUESTIONS } from "@/lib/quiz"


export default function PsychologicalQuizPage() {
  const navigate = useNavigate()
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const answeredCount = Object.keys(answers).length
  const totalCount = QUIZ_QUESTIONS.length
  const progressPercent = Math.round((answeredCount / totalCount) * 100)

  function handleSelect(questionId: number, scoreStr: string) {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Number(scoreStr),
    }))
  }

  function handleSubmit() {
    console.log("Результати відповідей користувача:", answers)
    toast.add({
      type: "success",
      title: "Відповіді зафіксовано!",
      description: "Ваші відповіді допоможуть нам покращити підбір кандидатів для Вас!",
    })

    navigate('/')
  }


  const viewportRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground">
      {/* Верхня панель з прогресом */}
      <header className="flex flex-col gap-3 border-b border-border/60 bg-card/60 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-muted-foreground hover:text-foreground"
            >
              Назад
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Психологічний тест особистості</h1>
          </div>
          <span className="text-sm font-medium text-muted-foreground">
            {answeredCount} з {totalCount} відповідей ({progressPercent}%)
          </span>
        </div>

        {/* Прогрес-бар */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </header>

      {/* Основний список питань */}
      <ScrollArea viewportRef={viewportRef} className="relative h-full min-h-0 flex-1 px-4">
        <div className="mx-auto max-w-4xl space-y-6 pb-20">
          {QUIZ_QUESTIONS.map((q, index) => {
            const selectedScore = answers[q.id]
            const isAnswered = selectedScore !== undefined

            return (

              <div
                key={q.id}
                className={`rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 ${isAnswered
                  ? "border-primary/40 bg-card/90 shadow-md"
                  : "border-border/60 hover:border-border"
                  }`}
              >
                <div className="mb-4 flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <h3 className="text-base font-semibold leading-relaxed tracking-tight">
                    {q.text}
                  </h3>
                </div>

                {/* Варіанти відповідей справа наліво */}
                <RadioGroup
                  value={selectedScore !== undefined ? String(selectedScore) : undefined}
                  onValueChange={(val) => handleSelect(q.id, val)}
                  className="flex flex-row-reverse flex-wrap items-center justify-end gap-2.5 pt-1"
                >
                  {QUIZ_OPTIONS.map((opt) => {
                    const optionId = `q-${q.id}-opt-${opt.score}`
                    const isChecked = selectedScore === opt.score

                    return (
                      <Label
                        key={opt.score}
                        htmlFor={optionId}
                        className={`group relative flex cursor-pointer items-center gap-2.5 rounded-xl border px-3.5 py-2.5 text-xs font-medium transition-all ${isChecked
                          ? "border-primary bg-primary text-primary-foreground shadow-sm"
                          : "border-border/70 bg-muted/20 text-muted-foreground hover:border-foreground/30 hover:bg-muted/40 hover:text-foreground"
                          }`}
                      >
                        <RadioGroupItem
                          value={String(opt.score)}
                          id={optionId}
                          className={
                            isChecked
                              ? "border-primary-foreground text-primary-foreground"
                              : "border-muted-foreground/60"
                          }
                        />
                        <span className="select-none capitalize">{opt.label}</span>
                      </Label>
                    )
                  })}
                </RadioGroup>
              </div>
            )
          })}


          {/* Нижня плашка завершення */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border/60 bg-muted/30 p-6 text-center sm:flex-row sm:text-left">
            <div>
              <h4 className="font-semibold">Готові зберегти відповіді?</h4>
              <p className="text-sm text-muted-foreground">
                Ви завжди зможете повернутися та пройти тест заново у налаштуваннях.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleSubmit}
              disabled={answeredCount === 0}
              className="w-full sm:w-auto"
            >
              Зберегти результати
            </Button>
          </div>
        </div >
      </ScrollArea>
    </div >
  )
}