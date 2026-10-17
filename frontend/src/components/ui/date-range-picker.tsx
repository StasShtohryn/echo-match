import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
}) {
  const label = value?.from ? (
    value.to ? (
      <>
        {format(value.from, "d MMM yyyy", { locale: uk })} –{" "}
        {format(value.to, "d MMM yyyy", { locale: uk })}
      </>
    ) : (
      format(value.from, "d MMM yyyy", { locale: uk })
    )
  ) : (
    <span>Оберіть дати</span>
  )

  return (
    <div className="min-w-0">
      <Popover>
        <PopoverTrigger
          render={
            <Button
              aria-label="Фільтр за діапазоном дат"
              className="h-10 w-full min-w-0 justify-start gap-2 rounded-xl border border-border bg-background px-3 font-normal text-foreground hover:bg-muted"
              variant="outline"
            >
              <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{label}</span>
            </Button>
          }
        />
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            defaultMonth={value?.from}
            locale={uk}
            mode="range"
            numberOfMonths={2}
            onSelect={onChange}
            selected={value}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

export { DateRangePicker }
