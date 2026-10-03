import { getMyProfile, type DiscoveryPreferences, type UpdatePreferencesRequest } from "@/services/auth-service";
import React, { useEffect } from "react";
import { useState } from "react";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { Minus, Plus } from "lucide-react";
import { FilterSkeleton } from "./filter-sceleton";


interface FilterlProps {
  isSaving?: boolean
  initialPreferences?: DiscoveryPreferences | null
  onApply: (preferences: UpdatePreferencesRequest) => void
}

export function FilterPanel({ isSaving = false, initialPreferences, onApply }: FilterlProps) {

  const minLimit = 18;
  const maxLimit = 99;

  const minDistanceLimit = 1;
  const maxDistanceLimit = 150;


  // Ініціалізація з дефолтними значеннями
  const [minAge, setMinAge] = useState<number>(initialPreferences?.minAge ?? minLimit)
  const [maxAge, setMaxAge] = useState<number>(initialPreferences?.maxAge ?? maxLimit)
  const [minInput, setMinInput] = useState<string>(String(initialPreferences?.minAge ?? minLimit))
  const [maxInput, setMaxInput] = useState<string>(String(initialPreferences?.maxAge ?? maxLimit))
  const [lookingFor, setLookingFor] = useState<string>(initialPreferences?.showMe ?? "Women")
  const [maxDistanceKm, setMaxDistanceKm] = useState<number | null>(
    initialPreferences?.maxDistanceKm ?? minDistanceLimit
  )

  useEffect(() => {
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

  // 1. Поки дані завантажуються з бекенду — показуємо скелетон
  if (!initialPreferences) {
    return <FilterSkeleton />
  }

  return (
    <div className="space-y-4">
      <label htmlFor="lookingFor" className="block text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
        Вік
      </label>
      <div className=" flex justify-between items-center px-1">

        {/* Мінімальний вік */}
        <input
          type="text"
          inputMode="numeric"
          value={minInput}
          onChange={handleMinInputChange}
          onBlur={handleMinBlur}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          className="font-[family-name:var(--font3)] w-20 rounded-xl border border-input bg-background py-1.5 text-center text-sm font-bold text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
        />

        {/* Максимальний вік */}
        <input
          type="text"
          inputMode="numeric"
          value={maxInput}
          onChange={handleMaxInputChange}
          onBlur={handleMaxBlur}
          onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
          className="font-[family-name:var(--font3)] w-20 rounded-xl border border-input bg-background py-1.5 text-center text-sm font-bold text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30"
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

      <div className="font-[family-name:var(--font3)] flex items-center gap-2 text-xs text-muted-foreground select-none">
        <Checkbox
          id="unlimitedDistance"
          checked={maxDistanceKm === null}
          onCheckedChange={(checked) => setMaxDistanceKm(checked === true ? null : 150)}
        />
        <label htmlFor="unlimitedDistance" className="cursor-pointer">
          Без обмежень по відстані
        </label>
      </div>

      {maxDistanceKm !== null && (
        <div className="relative flex items-center">
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={(maxDistanceKm ?? 50) <= 1}
            onClick={() => setMaxDistanceKm((prev) => Math.max(1, (prev ?? 50) - 5))}
            className="absolute left-2 rounded-xl border-border bg-background text-primary hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed"
          >
            <Minus className="size-3.5" />
          </Button>

          <Input
            id="maxDistance"
            type="text"
            inputMode="numeric"
            value={maxDistanceKm ?? ""}
            onChange={(e) => {
              const rawVal = e.target.value.replace(/\D/g, "");

              if (rawVal === "") {
                setMaxDistanceKm(null);
                return;
              }

              const num = Number(rawVal);
              if (num > maxDistanceLimit) {
                setMaxDistanceKm(maxDistanceLimit);
              } else {
                setMaxDistanceKm(num);
              }
            }}

            onBlur={() => {
              // Коригування при виході з поля
              if (maxDistanceKm === null || maxDistanceKm < minDistanceLimit) {
                setMaxDistanceKm(minDistanceLimit);
              } else if (maxDistanceKm > maxDistanceLimit) {
                setMaxDistanceKm(maxDistanceLimit);
              }
            }}
            className="h-11 w-full rounded-2xl border-input bg-background px-10 text-center text-base font-bold text-foreground focus-visible:border-ring focus-visible:ring-ring/30"
          />

          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            disabled={(maxDistanceKm ?? 50) >= 150}
            onClick={() => setMaxDistanceKm((prev) => Math.min(150, (prev ?? 50) + 5))}
            className="absolute right-2 rounded-xl border-border bg-background text-primary hover:bg-accent hover:text-accent-foreground disabled:cursor-not-allowed"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      )}

      <Button
        className="w-full"
        disabled={isSaving}
        onClick={() => onApply({ showMe: lookingFor, minAge, maxAge, maxDistanceKm })}
      >
        {isSaving ? "Зберігаємо..." : "Застосувати фільтри"}
      </Button>

    </div>
  )
}
