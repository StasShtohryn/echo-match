import { format } from "date-fns"
import { uk } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

function DatePicker({
  value,
  onChange,
  disabled,
  label,
}: {
  value: Date | undefined
  onChange: (value: Date | undefined) => void
  disabled?: React.ComponentProps<typeof Calendar>["disabled"]
  label: string
}) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            aria-label={label}
            className="h-10 min-w-0 w-full justify-start gap-2 rounded-xl border-border bg-background px-3 font-normal text-foreground hover:bg-muted"
            variant="outline"
          >
            <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">
              {value ? format(value, "d MMM yyyy", { locale: uk }) : "Оберіть дату"}
            </span>
          </Button>
        }
      />
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          disabled={disabled}
          mode="single"
          onSelect={onChange}
          selected={value}
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
