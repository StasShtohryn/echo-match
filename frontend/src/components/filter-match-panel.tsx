import { useRef } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { ScrollArea } from "./ui/scroll-area";
import type { DiscoveryPreferences, UpdatePreferencesRequest } from "@/services/auth-service"
import type { Match } from "@/types/match.types"
import { FilterPanel } from "./filter-panel";


interface FilterMatchPanelProps {
  isSaving?: boolean
  initialPreferences?: DiscoveryPreferences | null
  matches: Match[]
  isMatchesLoading?: boolean
  onApply: (preferences: UpdatePreferencesRequest) => void
}

export function FilterMatchPanel({
  matches,
  isMatchesLoading = false,
  isSaving = false,
  initialPreferences,
  onApply,
}: FilterMatchPanelProps) {
  // Прокрутка 
  const viewportRef = useRef<HTMLDivElement>(null)

  return (
    <ScrollArea viewportRef={viewportRef} className="flex h-screen w-80 shrink-0 flex-col border-r border-border/80 bg-card/55 p-5 font-sans select-none">
      <Accordion
        defaultValue={[]}
        className="w-full overflow-visible rounded-none border-0"
      >
        <AccordionItem value="filters" className="border-0 bg-transparent">
          <AccordionTrigger className="mb-3 p-0 text-xs font-bold tracking-wider text-foreground uppercase hover:no-underline">
            Фільтри
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            <FilterPanel initialPreferences={initialPreferences} isSaving={isSaving} onApply={onApply} />
          </AccordionContent>
        </AccordionItem>


        <AccordionItem value="matches" className="border-0 bg-transparent">
          <AccordionTrigger className="mb-3 p-0 text-xs font-bold tracking-wider text-foreground uppercase hover:no-underline">
            Нові метчі
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            <div className="overflow-y-auto">
              {isMatchesLoading ? (
                <p className="px-1 py-3 text-xs text-muted-foreground">Завантаження...</p>
              ) : matches.length === 0 ? (
                <p className="px-1 py-3 text-xs text-muted-foreground">Поки що немає метчів</p>
              ) : matches.map((match) => (
                <div
                  key={match.id}
                  className="flex cursor-pointer items-center gap-3.5 rounded-lg px-1 py-3.5 transition-colors hover:bg-muted/60"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-lg font-semibold text-muted-foreground">
                    {match.partner.mainPhotoUrl ? (
                      <img
                        src={match.partner.mainPhotoUrl}
                        alt={match.partner.displayName}
                        className="size-full rounded-xl object-cover"
                      />
                    ) : (
                      match.partner.displayName.charAt(0).toUpperCase()
                    )}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-sm font-bold leading-tight text-foreground">
                      {match.partner.displayName}, {match.partner.age}
                    </span>
                    <span className="mt-0.5 text-xs text-muted-foreground">
                      {match.isNew ? "Новий метч" : "Метч"}
                    </span>

                  </div>

                </div>

              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ScrollArea>
  );
};