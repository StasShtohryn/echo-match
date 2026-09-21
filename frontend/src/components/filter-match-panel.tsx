import React, { useRef, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button"
import type { DiscoveryPreferences, UpdatePreferencesRequest } from "@/services/auth-service"

interface MatchItem {
  id: string;
  name: string;
  subtitle: string;
  avatarLetter?: string;
  avatarUrl?: string;
}
////////////////////////////////////////////////////////////////////////////////////////////////////////////
const mockMatches: MatchItem[] = [
  { id: "1", name: "Марія", subtitle: "Новий метч", avatarLetter: "М" },
  { id: "2", name: "Марія", subtitle: "Новий метч", avatarLetter: "М" },
  { id: "3", name: "Марія", subtitle: "Новий метч", avatarLetter: "М" },
  { id: "4", name: "Марія", subtitle: "Новий метч", avatarLetter: "М" },
];
////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface FilterMatchPanelProps {
  isSaving?: boolean
  initialPreferences?: DiscoveryPreferences | null
  onApply: (preferences: UpdatePreferencesRequest) => void
}

export function FilterMatchPanel({ isSaving = false, initialPreferences, onApply }: FilterMatchPanelProps) {
  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(60);

  const [minInput, setMinInput] = useState<string>("18");
  const [maxInput, setMaxInput] = useState<string>("50");

  const minLimit = 18;
  const maxLimit = 99;

  const [lookingFor, setLookingFor] = useState("Women");
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(50);

  React.useEffect(() => {
    if (!initialPreferences) return

    setLookingFor(initialPreferences.showMe)
    setMinAge(initialPreferences.minAge)
    setMaxAge(initialPreferences.maxAge)
    setMinInput(String(initialPreferences.minAge))
    setMaxInput(String(initialPreferences.maxAge))
    setMaxDistanceKm(initialPreferences.maxDistanceKm)
  }, [initialPreferences])

  // Оновлення повзунком
  const handleAgeSliderChange = (value: number | readonly number[]) => {
    if (!Array.isArray(value) || value.length < 2) return;

    const [nextMinAge, nextMaxAge] = value;
    setMinAge(nextMinAge);
    setMaxAge(nextMaxAge);
    setMinInput(String(nextMinAge));
    setMaxInput(String(nextMaxAge));
  };

  // Оновлення введенням із клавіатури
  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setMinInput(rawVal);

    const val = Number(rawVal);
    if (!isNaN(val) && rawVal.trim() !== "" && val >= minLimit && val < maxAge) {
      setMinAge(val);
    }
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setMaxInput(rawVal);

    const val = Number(rawVal);
    if (!isNaN(val) && rawVal.trim() !== "" && val > minAge && val <= maxLimit) {
      setMaxAge(val);
    }
  };



  // Автокорекція меж при виході з поля
  const handleMinBlur = () => {
    let val = Number(minInput);
    if (isNaN(val) || minInput.trim() === "" || val < minLimit) {
      val = minLimit;
    } else if (val >= maxAge) {
      val = maxAge - 1;
    }
    setMinAge(val);
    setMinInput(String(val));
  };

  const handleMaxBlur = () => {
    let val = Number(maxInput);
    if (isNaN(val) || maxInput.trim() === "" || val > maxLimit) {
      val = maxLimit;
    } else if (val <= minAge) {
      val = minAge + 1;
    }
    setMaxAge(val);
    setMaxInput(String(val));
  };



  // Прокрутка 
  const viewportRef = useRef<HTMLDivElement>(null)


  return (
    <ScrollArea viewportRef={viewportRef} className="flex h-screen w-80 shrink-0 flex-col border-r border-border/80 bg-card/55 p-5 font-sans select-none">
      <Accordion
        defaultValue={["filters"]}
        className="w-full overflow-visible rounded-none border-0"
      >
        <AccordionItem value="filters" className="border-0 bg-transparent">
          <AccordionTrigger className="mb-3 p-0 text-xs font-bold tracking-wider text-foreground uppercase hover:no-underline">
            Фільтри
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
          <div className="space-y-4">
            {/* Поля вводу віку */}
            <div className="flex justify-between items-center px-1">
              {/* Мінімальний вік */}
              <input
                type="text"
                inputMode="numeric"
                value={minInput}
                onChange={handleMinInputChange}
                onBlur={handleMinBlur}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-20 rounded-xl border border-input bg-background py-1.5 text-center text-sm font-bold text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />

              {/* Максимальний вік */}
              <input
                type="text"
                inputMode="numeric"
                value={maxInput}
                onChange={handleMaxInputChange}
                onBlur={handleMaxBlur}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-20 rounded-xl border border-input bg-background py-1.5 text-center text-sm font-bold text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
              />
            </div>

            <Slider
              aria-label="Віковий діапазон"
              min={minLimit}
              max={maxLimit}
              step={1}
              value={[minAge, maxAge]}
              onValueChange={handleAgeSliderChange}
              className="w-full py-2"
            />

            <label htmlFor="lookingFor" className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Кого шукаю
            </label>

            <Select value={lookingFor} onValueChange={(value) => setLookingFor(value ?? "Women")}>
              <SelectTrigger
                id="lookingFor"
                className="h-9 w-full rounded-xl border-input bg-background text-xs font-bold text-foreground"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Women">Дівчат</SelectItem>
                <SelectItem value="Men">Хлопців</SelectItem>
                <SelectItem value="Everyone">Будь-кого</SelectItem>
              </SelectContent>
            </Select>

            <label htmlFor="maxDistance" className="block text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Максимальна відстань, км
            </label>
            <input
              id="maxDistance"
              type="number"
              min={1}
              max={160}
              disabled={maxDistanceKm === null}
              value={maxDistanceKm ?? ""}
              onChange={(event) => setMaxDistanceKm(event.target.value ? Number(event.target.value) : null)}
              className="h-9 w-full rounded-xl border border-input bg-background px-3 text-center text-sm font-bold text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
            />
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={maxDistanceKm === null}
                onChange={(event) => setMaxDistanceKm(event.target.checked ? null : 50)}
              />
              Без обмежень
            </label>

            <Button
              className="w-full"
              disabled={isSaving}
              onClick={() => onApply({ showMe: lookingFor, minAge, maxAge, maxDistanceKm })}
            >
              {isSaving ? "Зберігаємо..." : "Застосувати фільтри"}
            </Button>

          </div>
          </AccordionContent>
        </AccordionItem>







        <AccordionItem value="matches" className="border-0 bg-transparent">
          <AccordionTrigger className="mb-3 p-0 text-xs font-bold tracking-wider text-foreground uppercase hover:no-underline">
            Нові метчі
          </AccordionTrigger>
          <AccordionContent className="px-0 pb-0">
          <div className="overflow-y-auto">
            {mockMatches.map((match) => (
              <div
                key={match.id}
                className="flex cursor-pointer items-center gap-3.5 rounded-lg px-1 py-3.5 transition-colors hover:bg-muted/60"
              >
                <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-lg font-semibold text-muted-foreground">
                  {match.avatarUrl ? (
                    <img
                      src={match.avatarUrl}
                      alt={match.name}
                      className="size-full rounded-xl object-cover"
                    />
                  ) : (
                    match.avatarLetter
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-sm font-bold leading-tight text-foreground">
                    {match.name}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {match.subtitle}
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