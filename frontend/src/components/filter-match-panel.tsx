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
import { Link } from "react-router"


interface FilterMatchPanelProps {
  isSaving?: boolean
  initialPreferences?: DiscoveryPreferences | null
  matches: Match[]
  isMatchesLoading?: boolean
  onApply: (preferences: UpdatePreferencesRequest) => void
  onMatchClick?: (matchId: string) => void;
}

export function FilterMatchPanel({
  matches,
  isMatchesLoading = false,
  isSaving = false,
  initialPreferences,
  onApply,
  onMatchClick,
}: FilterMatchPanelProps) {
  // Прокрутка 
  const viewportRef = useRef<HTMLDivElement>(null)
  const unreadMatches = matches.filter((m) => m.isNew || m.unreadCount > 0)
  const hasUnreadOrNew = unreadMatches.length > 0

  return (
    <ScrollArea viewportRef={viewportRef} className="flex h-screen w-80 shrink-0 flex-col border-r border-border/80 bg-card/55 p-5 select-none">
      <Accordion
        defaultValue={["filters", "matches"]}
        className="w-full overflow-visible rounded-none border-0"
      >
        <AccordionItem value="filters" className="border-0 bg-transparent">
          <AccordionTrigger className="mb-3 p-0 text-xs font-bold tracking-wider uppercase hover:no-underline">
            Фільтри
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            <FilterPanel initialPreferences={initialPreferences} isSaving={isSaving} onApply={onApply} />
          </AccordionContent>
        </AccordionItem>


        <AccordionItem value="matches" className="border-0 bg-transparent">
          <AccordionTrigger
            className={`mb-3 p-0 text-xs font-bold tracking-wider uppercase hover:no-underline transition-colors ${hasUnreadOrNew ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <div className="flex items-center gap-2">
              <span>Нові дії</span>
              {hasUnreadOrNew && (
                <span className="size-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
            <div className="overflow-y-auto">
              {isMatchesLoading ? (
                <p className="px-1 py-3 text-xs text-muted-foreground">Завантаження...</p>
              ) : unreadMatches.length === 0 ? (
                <p className="px-1 py-3 text-xs text-muted-foreground">Поки що немає нових метчів чи повідомлень</p>
              ) : (
                unreadMatches.map((match) => (
                  <Link
                    key={match.id}
                    to={`/messenger/${match.id}`}
                    onClick={() => onMatchClick?.(match.id)}
                    className="flex cursor-pointer items-center gap-3.5 rounded-lg px-1 py-3.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="relative flex size-12 shrink-0 items-center justify-center rounded-xl bg-muted text-lg font-semibold text-muted-foreground">
                      {match.partner.mainPhotoUrl ? (
                        <img
                          src={match.partner.mainPhotoUrl}
                          alt={match.partner.displayName}
                          className="size-full rounded-xl object-cover"
                        />
                      ) : (
                        match.partner.displayName.charAt(0).toUpperCase()
                      )}
                      {match.isNew && (
                        <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-card bg-primary" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="text-sm font-bold leading-tight text-foreground">
                        {match.partner.displayName}, {match.partner.age}
                      </span>
                      <span className="mt-0.5 truncate text-xs text-muted-foreground">
                        {match.lastMessage?.text ?? (match.isNew ? "Новий метч" : "Почніть розмову")}
                      </span>
                    </div>
                    {match.unreadCount > 0 && (
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {match.unreadCount > 99 ? "99+" : match.unreadCount}
                      </span>
                    )}
                  </Link>
                ))
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </ScrollArea>
  );
};