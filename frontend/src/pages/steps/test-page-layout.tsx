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
      <div className="flex w-full max-w-xl flex-col justify-between border-x border-[#EADCCF]/80 pb-8 sm:px-10">
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
              className="flex h-12 flex-1 cursor-pointer items-center justify-center rounded-2xl border border-[#CBD5E1] bg-white text-sm font-bold text-[#1E293B] transition-all hover:bg-slate-50 active:scale-[0.98] disabled:cursor-not-allowed "
              variant="ghost"
            >
              Назад
            </Button>
          ) : (
            <div className="flex h-12 flex-1 items-center justify-center rounded-2xl border border-[#CBD5E1] bg-white text-sm font-bold text-[#1E293B] transition-all hover:bg-slate-50 active:scale-[0.98] cursor-not-allowed opacity-50"
            > Назад </div>
          )}

          <Button
            type="button"
            onClick={onNext}
            disabled={!canContinue || isLoading}
            className={cn(
              "flex h-12 flex-1 cursor-pointer items-center justify-center rounded-2xl text-sm font-bold text-white shadow-xs transition-all active:scale-[0.98]",
              canContinue && !isLoading
                ? "bg-[#FF8A3D] hover:bg-[#FF7A24]"
                : "bg-[#FFD2B2] cursor-not-allowed"
            )}
          >
            {isLoading ? (
              <Loader2 className="size-5 animate-spin text-white" />
            ) : (
              nextButtonText
            )}
          </Button>
        </div>
      </div >
    </div >
  )
}