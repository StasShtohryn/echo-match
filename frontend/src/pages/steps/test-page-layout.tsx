import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

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
    <div className="flex min-h-screen justify-center bg-background px-4 py-6">
      <div className="flex min-h-[640px] w-full max-w-xl flex-col justify-between border-x border-[#EADCCF]/80 px-6 py-6 sm:px-10">
        <div>

          <div className="mb-10 flex items-center justify-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 flex-1 rounded-full transition-colors ${idx < currentStep ? "bg-[#FA5E50]" : "bg-[#6A7178]"
                  }`}
              />
            ))}
          </div>


          <div className="mb-8 text-center">
            <h1 className="pb-3 text-xl font-bold tracking-wide text-[#2A2B2E] sm:text-2xl">
              {title}
            </h1>
            <div className="h-[1.5px] w-full bg-[#FFB580]/70" />
          </div>
        </div>
        <ScrollArea viewportRef={viewportRef} className="relative h-full min-h-0 flex-1 px-4 w-full mb-6 mt-3">
          {children}

          <div className="mt-12 mb-4 flex flex-col items-center gap-3">
            <Button
              type="button"
              onClick={onNext}
              disabled={!canContinue || isLoading}
              className={`w-full max-w-sm rounded-xl py-6 text-base font-bold tracking-wide text-white shadow-md transition-all ${canContinue && !isLoading
                ? "bg-[#FF8A3D] hover:bg-[#e8762b] cursor-pointer active:scale-[0.99]"
                : "bg-[#FF8A3D]/70 opacity-80"
                }`}
            >
              {isLoading ? "Збереження..." : nextButtonText}
            </Button>

            {onBack && (
              <Button
                type="button"
                variant="ghost"

                onClick={onBack}
                disabled={isLoading}
                className="cursor-pointertext-sm font-medium text-[#6A7178] hover:bg-transparent hover:text-[#2A2B2E]"
              >
                Назад
              </Button>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}