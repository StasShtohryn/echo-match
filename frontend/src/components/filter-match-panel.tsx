import React, { useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronUp } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

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

export function FilterMatchPanel() {
  // Згортання/розгортання секцій
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isMatchesOpen, setIsMatchesOpen] = useState(true);

  const [minAge, setMinAge] = useState<number>(18);
  const [maxAge, setMaxAge] = useState<number>(60);

  const [minInput, setMinInput] = useState<string>("18");
  const [maxInput, setMaxInput] = useState<string>("60");

  const minLimit = 18;
  const maxLimit = 80;

  const [lookingFor, setLookingFor] = useState("female");

  // Оновлення повзунком
  const handleMinSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), maxAge - 1);
    setMinAge(value);
    setMinInput(String(value));
  };

  const handleMaxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), minAge + 1);
    setMaxAge(value);
    setMaxInput(String(value));
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



  // Розрахунок позиції помаранчевої смужки 
  const minPercent = ((minAge - minLimit) / (maxLimit - minLimit)) * 100;
  const maxPercent = ((maxAge - minLimit) / (maxLimit - minLimit)) * 100;


  // Прокрутка 
  const viewportRef = useRef<HTMLDivElement>(null)


  return (
    <ScrollArea viewportRef={viewportRef} className="w-80 h-screen bg-[#FFF8F2] border-r border-[#E8D9CD] flex flex-col p-5 font-sans select-none overflow-y-auto">
      {/* СЕКЦІЯ ФІЛЬТРІВ */}
      <section className="mb-6 font-[family-name:var(--font-family)]">
        <button
          type="button"
          onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          className="flex items-center gap-1.5 text-[#3D2C24] font-bold text-xs tracking-wider uppercase mb-3 hover:opacity-80"
        >
          <span>Фільтри</span>
          {isFiltersOpen ? (
            <ChevronDown className="w-4 h-4 text-[#EF5350]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#EF5350]" />
          )}
        </button>

        <div className="h-[1px] w-full mb-5" >
          <svg height="2" viewBox="0 0 452 2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M451 1L1 1" stroke="#FF8A3D" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>


        {isFiltersOpen && (
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
                className="w-20 py-1.5 text-center text-sm font-bold text-[#3D2C24] bg-white border border-[#FF9F76] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40"
              />

              {/* Максимальний вік */}
              <input
                type="text"
                inputMode="numeric"
                value={maxInput}
                onChange={handleMaxInputChange}
                onBlur={handleMaxBlur}
                onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                className="w-20 py-1.5 text-center text-sm font-bold text-[#3D2C24] bg-white border border-[#FF9F76] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40"
              />
            </div>

            {/* Slider */}
            <div className="relative w-full h-8 flex items-center">
              <div className="absolute w-full h-2 bg-[#DCE2E6] rounded-full" />
              {/* Активний діапазон */}
              <div
                className="absolute h-2 bg-[#FF6B35] rounded-full pointer-events-none"
                style={{
                  left: `${minPercent}%`,
                  width: `${maxPercent - minPercent}%`,
                }}
              />

              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                value={minAge}
                onChange={handleMinSliderChange}
                className={`range-slider-thumb absolute w-full h-2 appearance-none bg-transparent pointer-events-none ${minAge > maxLimit - 10 ? "z-30" : "z-20"
                  }`}
              />
              <input
                type="range"
                min={minLimit}
                max={maxLimit}
                value={maxAge}
                onChange={handleMaxSliderChange}
                className="range-slider-thumb absolute w-full h-2 appearance-none bg-transparent pointer-events-none z-20"
              />
            </div>

            <label htmlFor="lookingFor" className="block text-[10px] font-bold text-[#8D827A] uppercase tracking-wider">
              Кого шукаю
            </label>

            <div className="relative">
              <select
                id="lookingFor"
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value)}
                className="w-full appearance-none bg-white border border-[#FF9F76] text-[#3D2C24] text-xs font-bold py-2 px-3 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/40 focus:border-[#FF6B35] cursor-pointer"
              >
                <option value="female">Дівчат</option>
                <option value="male">Хлопців</option>
                <option value="everyone">Будь-кого</option>
              </select>

              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#FF6B35]">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Розділювач секцій */}
            <div className="h-[1px] w-full mb-5 mt-2" >
              <svg height="2" viewBox="0 0 452 2" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M451 1L1 1" stroke="#FF8A3D" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round" />
              </svg>
            </div>
          </div>

        )}

      </section>







      {/* СЕКЦІЯ НОВИХ МЕТЧІВ */}
      <section className="flex-1 flex flex-col">
        <button
          type="button"
          onClick={() => setIsMatchesOpen(!isMatchesOpen)}
          className="flex items-center gap-1.5 text-[#3D2C24] font-bold text-xs tracking-wider uppercase mb-3 hover:opacity-80"
        >
          <span>Нові метчі</span>
          {isMatchesOpen ? (
            <ChevronDown className="w-4 h-4 text-[#EF5350]" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-[#EF5350]" />
          )}
        </button>

        <div className="h-[1px] w-full mb-2 mt-2" >
          <svg height="2" viewBox="0 0 452 2" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M451 1L1 1" stroke="#FF8A3D" stroke-opacity="0.4" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>

        {isMatchesOpen && (
          <div className="divide-y divide-[#FF8A3D66] overflow-y-auto">
            {mockMatches.map((match) => (
              <div
                key={match.id}
                className="flex items-center gap-3.5 py-3.5 px-1 hover:bg-[#F9ECE0]/50 rounded-lg cursor-pointer transition-colors"
              >
                <div className="w-12 h-12 bg-[#CED6DC] rounded-xl flex items-center justify-center text-[#7E8B93] text-lg font-semibold">
                  {match.avatarUrl ? (
                    <img
                      src={match.avatarUrl}
                      alt={match.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    match.avatarLetter
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="text-[#3D2C24] font-bold text-sm leading-tight">
                    {match.name}
                  </span>
                  <span className="text-[#8D827A] text-xs mt-0.5">
                    {match.subtitle}
                  </span>

                </div>

              </div>

            ))}
          </div>
        )}
      </section>
    </ScrollArea>
  );
};