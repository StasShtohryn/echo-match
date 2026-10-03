import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TestStepLayoutProps {
  currentStep: number
  totalSteps: number
  title: string
  canContinue: boolean
  onNext: () => void
  onBack?: () => void
  isLoading?: boolean
  nextButtonText?: string
  children: React.ReactNode
}

export function TestPage({
  currentStep,
  totalSteps,
  title,
  canContinue,
  onNext,
  onBack,
  isLoading = false,
  nextButtonText = "Далі",
  children,
}: TestStepLayoutProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  return (
    <div className="flex min-h-screen justify-center bg-background px-4 px-4 pt-2 pb-16">
      <div className="flex w-full max-w-xl flex-col justify-between border-x border-border pb-8 sm:px-10">
        <div>

          <div className="mb-10 flex items-center justify-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-colors ${idx < currentStep ? "bg-primary" : "bg-muted"
                  }`}
              />
            ))}
          </div>


          <div className="mb-8 text-center">
            <h1 className="pb-3 text-xl font-bold tracking-wide font-heading text-foreground sm:text-2xl">
              {title}
            </h1>
            <div className="h-px w-full bg-border" />
          </div>
        </div>
        <ScrollArea viewportRef={viewportRef} className="relative h-full min-h-0 flex-1 px-4 w-full mb-6 mt-3">
          <div className="my-auto w-full py-6">
            {children}
          </div>
        </ScrollArea>


        <div className="mt-8 flex w-full items-center justify-between gap-4">
          {onBack ? (
            <Button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="h-12 flex-1 rounded-2xl text-sm font-bold active:scale-[0.98]"
              variant="outline"
            >
              Назад
            </Button>
          ) : (
            <Button
              type="button"
              disabled
              variant="outline"
              className="h-12 flex-1 rounded-2xl text-sm font-bold"
            >
              Назад
            </Button>
          )}

          <Button
            type="button"
            onClick={onNext}
            disabled={!canContinue || isLoading}
            className={cn(
              "h-12 flex-1 rounded-2xl text-sm font-bold shadow-xs active:scale-[0.98]"
            )}
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              nextButtonText
            )}
          </Button>
        </div>
      </div >
    </div >
  )
}