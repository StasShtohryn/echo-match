import type { FC } from "react";
import { Separator } from "./ui/separator";
import { ScrollArea } from "./ui/scroll-area";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Heart, MessageCircle, Compass, Quote } from "lucide-react";
import {
  getLabel,
  GOAL_OPTIONS,
  ORIENTATION_OPTIONS,
  LOVE_STYLE_OPTIONS,
  COMMUNICATION_OPTIONS,
  PET_OPTIONS,
} from "@/lib/some-lookups";

export interface ProfileDetailsProps {
  displayName: string;
  age: number;
  bio: string | null;
  lookingFor?: string | null;
  orientation?: string | null;
  loveLanguage?: string | null;
  communication?: string | null;
  pets?: string | null;
  promptAnswer?: { question: string; answer: string } | null;
  compatibilityPercent: number | null;
}

export const InfoPanel: FC<ProfileDetailsProps> = ({
  displayName,
  age,
  bio,
  lookingFor,
  orientation,
  loveLanguage,
  communication,
  pets,
  promptAnswer,
  compatibilityPercent,
}) => {
  const orientationLabel = getLabel(ORIENTATION_OPTIONS, orientation);
  const loveLanguageLabel = getLabel(LOVE_STYLE_OPTIONS, loveLanguage);
  const communicationLabel = getLabel(COMMUNICATION_OPTIONS, communication);
  const petsLabel = getLabel(PET_OPTIONS, pets);

  return (
    <ScrollArea className="flex h-full w-80 shrink-0 flex-col justify-between border-l border-border/80 bg-card/55 p-6 font-sans select-none">
      <div className="space-y-4">
        {/* Заголовок */}
        <div>
          <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Про анкету
          </span>
          <h1 className="font-heading mt-1 text-2xl tracking-tight text-foreground">
            {displayName}, {age}
          </h1>
        </div>

        <Separator />

        {/* Опис профілю */}
        <p className="text-xs leading-relaxed text-foreground">
          {bio ?? "Користувач ще не додав опис профілю."}
        </p>

        {/* Орієнтація та Мова кохання / Спілкування (компактні значки) */}
        {(orientationLabel || loveLanguageLabel || communicationLabel) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h2 className="text-xs font-bold tracking-wider text-foreground uppercase">
                Особисте
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {orientationLabel && (
                  <Badge variant="secondary" className="gap-1 text-[11px] font-medium py-0.5">
                    <Compass className="size-3 text-primary" />
                    {orientationLabel}
                  </Badge>
                )}
                {loveLanguageLabel && (
                  <Badge variant="secondary" className="gap-1 text-[11px] font-medium py-0.5">
                    <Heart className="size-3 text-rose-500" />
                    {loveLanguageLabel}
                  </Badge>
                )}
                {communicationLabel && (
                  <Badge variant="outline" className="gap-1 text-[11px] font-medium py-0.5">
                    <MessageCircle className="size-3 text-primary" />
                    {communicationLabel}
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}

        {/* Сумісність */}
        {compatibilityPercent !== null && (
          <>
            <Separator />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-bold tracking-wider text-foreground uppercase">
                  Сумісність
                </h2>
                <span className="text-sm font-semibold tabular-nums text-foreground">
                  {compatibilityPercent}%
                </span>
              </div>
              <Progress
                value={Math.min(100, Math.max(0, compatibilityPercent))}
                aria-label="Сумісність"
                className="gap-0"
              />
            </div>
          </>
        )}

        {/* Секція: Шукаю */}
        {lookingFor && (
          <>
            <Separator />
            <div>
              <h2 className="mb-1 text-xs font-bold tracking-wider text-foreground uppercase">
                Шукаю
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {getLabel(GOAL_OPTIONS, lookingFor)}
              </p>
            </div>
          </>
        )}

        {/* Секція: Домашні тварини */}
        {petsLabel && (
          <>
            <Separator />
            <div>
              <h2 className="mb-1 text-xs font-bold tracking-wider text-foreground uppercase">
                Домашні тварини
              </h2>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {petsLabel}
              </p>
            </div>
          </>
        )}

        {/* Секція: Відповідь на питання (Prompt) */}
        {promptAnswer && (
          <>
            <Separator />
            <div className="rounded-xl border border-border/60 bg-background/50 p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Quote className="size-3.5" />
                <span>{promptAnswer.question}</span>
              </div>
              <p className="text-xs leading-relaxed text-foreground font-medium pt-0.5">
                {promptAnswer.answer}
              </p>
            </div>
          </>
        )}

      </div>
    </ScrollArea>
  );
};